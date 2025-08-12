import express from 'express'
import { supabase } from '../config/supabase.js'
import rateLimit from 'express-rate-limit'
import Joi from 'joi'

const router = express.Router()

// Rate limiting for contact form
const contactRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // limit each IP to 3 contact form submissions per windowMs
  message: { error: 'Too many contact form submissions, please try again later.' }
})

// Validation schema for contact form
const contactSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  company: Joi.string().min(2).max(200).required(),
  companyDomain: Joi.string().max(100).optional().allow(''),
  brandsCount: Joi.string().valid('5-10', '10-25', '25-50', '50-100', '100+').optional().allow(''),
  seats: Joi.string().valid('5-10', '10-25', '25-50', '50-100', '100+').optional().allow(''),
  monthlyPosts: Joi.string().valid('1k-5k', '5k-10k', '10k-25k', '25k-50k', '50k+').optional().allow(''),
  videoMinutes: Joi.string().valid('100-500', '500-1000', '1000-2500', '2500+').optional().allow(''),
  mustHaves: Joi.array().items(Joi.string().max(100)).max(10).default([]),
  integrations: Joi.array().items(Joi.string().max(100)).max(20).default([]),
  goals: Joi.string().max(2000).optional().allow('')
})

/**
 * POST /api/sales/contact
 * Handle contact sales form submission
 */
router.post('/contact', contactRateLimit, async (req, res) => {
  try {
    // Validate request body
    const { error, value } = contactSchema.validate(req.body)
    
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Invalid form data',
        details: error.details.map(detail => detail.message)
      })
    }

    const formData = value

    // Check for duplicate submissions (same email within 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    
    const { data: existingSubmission } = await supabase
      .from('agency_leads')
      .select('id')
      .eq('email', formData.email)
      .gte('created_at', twentyFourHoursAgo)
      .single()

    if (existingSubmission) {
      return res.status(429).json({
        success: false,
        error: 'A contact request from this email was already submitted within the last 24 hours.'
      })
    }

    // Save lead to database
    const { data: lead, error: dbError } = await supabase
      .from('agency_leads')
      .insert({
        name: formData.name,
        email: formData.email,
        company: formData.company,
        company_domain: formData.companyDomain,
        brands_count: formData.brandsCount,
        seats: formData.seats,
        monthly_posts: formData.monthlyPosts,
        video_minutes: formData.videoMinutes,
        must_haves: formData.mustHaves,
        integrations: formData.integrations,
        goals: formData.goals,
        status: 'new',
        source: 'contact_form',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (dbError) {
      console.error('Error saving agency lead:', dbError)
      return res.status(500).json({
        success: false,
        error: 'Failed to save contact information'
      })
    }

    // Send to CRM webhook if configured
    if (process.env.AGENCY_LEAD_WEBHOOK) {
      try {
        const webhookPayload = {
          leadId: lead.id,
          name: formData.name,
          email: formData.email,
          company: formData.company,
          companyDomain: formData.companyDomain,
          brandsCount: formData.brandsCount,
          seats: formData.seats,
          monthlyPosts: formData.monthlyPosts,
          videoMinutes: formData.videoMinutes,
          mustHaves: formData.mustHaves,
          integrations: formData.integrations,
          goals: formData.goals,
          estimatedValue: calculateEstimatedValue(formData),
          priority: calculatePriority(formData),
          submittedAt: lead.created_at
        }

        // Send webhook (don't await to avoid blocking response)
        fetch(process.env.AGENCY_LEAD_WEBHOOK, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'LaunchZone-Lead-Webhook/1.0'
          },
          body: JSON.stringify(webhookPayload)
        }).catch(error => {
          console.error('Error sending webhook:', error)
        })
      } catch (error) {
        console.error('Error preparing webhook:', error)
      }
    }

    // Send internal notification email (if email service is configured)
    await sendInternalNotification(lead, formData)

    // Log analytics event
    await supabase
      .from('analytics_events')
      .insert({
        event_name: 'agency_lead_submitted',
        event_properties: {
          lead_id: lead.id,
          company: formData.company,
          brands_count: formData.brandsCount,
          seats: formData.seats,
          estimated_value: calculateEstimatedValue(formData)
        },
        created_at: new Date().toISOString()
      })

    res.json({
      success: true,
      message: 'Contact request submitted successfully',
      leadId: lead.id
    })

  } catch (error) {
    console.error('Error processing contact form:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process contact request'
    })
  }
})

/**
 * GET /api/sales/leads (Admin only - would need auth middleware)
 * Get agency leads for admin dashboard
 */
router.get('/leads', async (req, res) => {
  try {
    // TODO: Add admin authentication middleware
    
    const { page = 1, limit = 20, status, search } = req.query
    
    let query = supabase
      .from('agency_leads')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })

    // Filter by status
    if (status && ['new', 'contacted', 'qualified', 'proposal', 'closed', 'lost'].includes(status)) {
      query = query.eq('status', status)
    }

    // Search filter
    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%,company.ilike.%${search}%`)
    }

    // Pagination
    const offset = (parseInt(page) - 1) * parseInt(limit)
    query = query.range(offset, offset + parseInt(limit) - 1)

    const { data: leads, error, count } = await query

    if (error) throw error

    res.json({
      success: true,
      leads,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        pages: Math.ceil(count / parseInt(limit))
      }
    })

  } catch (error) {
    console.error('Error fetching leads:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch leads'
    })
  }
})

/**
 * Calculate estimated monthly value based on form data
 */
function calculateEstimatedValue(formData) {
  let baseValue = 150 // Minimum agency pricing
  
  // Brand count multiplier
  const brandMultipliers = {
    '5-10': 1.2,
    '10-25': 1.5,
    '25-50': 2.0,
    '50-100': 3.0,
    '100+': 5.0
  }
  
  // Seat count multiplier
  const seatMultipliers = {
    '5-10': 1.1,
    '10-25': 1.3,
    '25-50': 1.8,
    '50-100': 2.5,
    '100+': 4.0
  }
  
  // Posts volume multiplier
  const postsMultipliers = {
    '1k-5k': 1.0,
    '5k-10k': 1.5,
    '10k-25k': 2.5,
    '25k-50k': 4.0,
    '50k+': 6.0
  }

  if (formData.brandsCount) {
    baseValue *= brandMultipliers[formData.brandsCount] || 1
  }
  
  if (formData.seats) {
    baseValue *= seatMultipliers[formData.seats] || 1
  }
  
  if (formData.monthlyPosts) {
    baseValue *= postsMultipliers[formData.monthlyPosts] || 1
  }
  
  // Must-have features add complexity
  if (formData.mustHaves && formData.mustHaves.length > 3) {
    baseValue *= 1.3
  }
  
  return Math.round(baseValue)
}

/**
 * Calculate lead priority score
 */
function calculatePriority(formData) {
  let score = 0
  
  // Higher brand count = higher priority
  const brandScores = {
    '5-10': 1,
    '10-25': 2,
    '25-50': 3,
    '50-100': 4,
    '100+': 5
  }
  
  score += brandScores[formData.brandsCount] || 0
  score += brandScores[formData.seats] || 0
  
  // High volume posting
  if (['25k-50k', '50k+'].includes(formData.monthlyPosts)) {
    score += 2
  }
  
  // Enterprise features requested
  const enterpriseFeatures = ['SSO/SAML Authentication', 'White-label branding', 'Audit logs']
  const hasEnterpriseFeatures = formData.mustHaves?.some(feature => 
    enterpriseFeatures.includes(feature)
  )
  
  if (hasEnterpriseFeatures) {
    score += 3
  }
  
  // Detailed goals indicate serious interest
  if (formData.goals && formData.goals.length > 100) {
    score += 1
  }
  
  // Convert to priority level
  if (score >= 8) return 'high'
  if (score >= 5) return 'medium'
  return 'low'
}

/**
 * Send internal notification about new lead
 */
async function sendInternalNotification(lead, formData) {
  try {
    // This would integrate with your email service
    // For now, just log the notification
    console.log(`New Agency Lead: ${formData.name} from ${formData.company}`)
    console.log(`Estimated Value: $${calculateEstimatedValue(formData)}/month`)
    console.log(`Priority: ${calculatePriority(formData)}`)
    
    // TODO: Implement actual email sending
    // Example with common email services:
    /*
    await emailService.send({
      to: process.env.SALES_NOTIFICATION_EMAIL,
      subject: `New Agency Lead: ${formData.company}`,
      template: 'agency_lead_notification',
      data: {
        lead,
        formData,
        estimatedValue: calculateEstimatedValue(formData),
        priority: calculatePriority(formData)
      }
    })
    */
    
  } catch (error) {
    console.error('Error sending internal notification:', error)
  }
}

export default router