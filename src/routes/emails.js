import express from 'express'
import { supabase } from '../config/supabase.js'
import { authenticateUser } from '../middleware/auth.js'
import lifecycleEmailJob from '../jobs/lifecycleEmails.js'
import emailService from '../services/emailService.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

// Rate limiting for email operations
const emailRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 email requests per windowMs
  message: { error: 'Too many email requests, please try again later.' }
})

/**
 * POST /api/emails/trigger-welcome
 * Manually trigger welcome email for a user (for testing or recovery)
 */
router.post('/trigger-welcome', authenticateUser, emailRateLimit, async (req, res) => {
  try {
    const { userId, subscriptionId } = req.body

    if (!userId || !subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'userId and subscriptionId are required'
      })
    }

    const success = await lifecycleEmailJob.triggerWelcomeEmail(userId, subscriptionId)

    if (success) {
      res.json({
        success: true,
        message: 'Welcome email triggered successfully'
      })
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to trigger welcome email'
      })
    }
  } catch (error) {
    console.error('Error triggering welcome email:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to trigger welcome email'
    })
  }
})

/**
 * GET /api/emails/stats
 * Get email statistics for current user
 */
router.get('/stats', authenticateUser, async (req, res) => {
  try {
    const { data: stats, error } = await supabase
      .rpc('get_user_email_stats', { user_id_param: req.user.id })

    if (error) throw error

    // Get recent email events
    const { data: recentEvents, error: eventsError } = await supabase
      .from('email_events')
      .select('email_type, status, sent_at, subject_line')
      .eq('user_id', req.user.id)
      .order('sent_at', { ascending: false })
      .limit(10)

    if (eventsError) throw eventsError

    res.json({
      success: true,
      stats: stats || [],
      recentEvents: recentEvents || []
    })
  } catch (error) {
    console.error('Error fetching email stats:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email statistics'
    })
  }
})

/**
 * GET /api/emails/preferences
 * Get user email preferences
 */
router.get('/preferences', authenticateUser, async (req, res) => {
  try {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('email_preferences')
      .eq('user_id', req.user.id)
      .single()

    if (error) throw error

    const defaultPreferences = {
      marketing: true,
      product_updates: true,
      billing: true,
      trial_reminders: true,
      usage_alerts: true
    }

    res.json({
      success: true,
      preferences: profile?.email_preferences || defaultPreferences
    })
  } catch (error) {
    console.error('Error fetching email preferences:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch email preferences'
    })
  }
})

/**
 * POST /api/emails/preferences
 * Update user email preferences
 */
router.post('/preferences', authenticateUser, async (req, res) => {
  try {
    const { preferences } = req.body

    if (!preferences || typeof preferences !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid preferences object'
      })
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .update({ 
        email_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', req.user.id)
      .select()
      .single()

    if (error) throw error

    res.json({
      success: true,
      preferences: data.email_preferences
    })
  } catch (error) {
    console.error('Error updating email preferences:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to update email preferences'
    })
  }
})

/**
 * POST /api/emails/unsubscribe
 * Unsubscribe user from specific email types or all emails
 */
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email, type = 'all', token } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      })
    }

    // Find user by email
    const { data: profile, error: profileError } = await supabase
      .from('user_profiles')
      .select('user_id, email_preferences')
      .eq('email', email)
      .single()

    if (profileError) throw profileError

    let updatedPreferences = profile.email_preferences || {}

    if (type === 'all') {
      // Unsubscribe from all email types
      updatedPreferences = {
        marketing: false,
        product_updates: false,
        billing: true, // Keep billing emails for legal reasons
        trial_reminders: false,
        usage_alerts: false
      }
    } else {
      // Unsubscribe from specific type
      updatedPreferences[type] = false
    }

    // Update preferences
    const { error: updateError } = await supabase
      .from('user_profiles')
      .update({ 
        email_preferences: updatedPreferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', profile.user_id)

    if (updateError) throw updateError

    // Log the unsubscribe event
    await supabase
      .rpc('log_email_event', {
        user_id_param: profile.user_id,
        subscription_id_param: null,
        email_type_param: 'unsubscribe',
        email_address_param: email,
        status_param: 'unsubscribed'
      })

    res.json({
      success: true,
      message: `Successfully unsubscribed from ${type === 'all' ? 'all marketing emails' : type + ' emails'}`
    })
  } catch (error) {
    console.error('Error processing unsubscribe:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process unsubscribe request'
    })
  }
})

/**
 * POST /api/emails/webhook
 * Handle email service provider webhooks (delivery, opens, clicks)
 */
router.post('/webhook', async (req, res) => {
  try {
    const { provider, events } = req.body

    if (!provider || !events) {
      return res.status(400).json({
        success: false,
        error: 'Provider and events are required'
      })
    }

    // Process webhook events based on provider
    for (const event of events) {
      try {
        await processWebhookEvent(provider, event)
      } catch (error) {
        console.error('Error processing webhook event:', error)
      }
    }

    res.json({
      success: true,
      processed: events.length
    })
  } catch (error) {
    console.error('Error processing email webhook:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to process webhook'
    })
  }
})

/**
 * POST /api/emails/test (Development only)
 * Test lifecycle emails
 */
if (process.env.NODE_ENV === 'development') {
  router.post('/test', emailRateLimit, async (req, res) => {
    try {
      const { type, email } = req.body

      if (!type || !email) {
        return res.status(400).json({
          success: false,
          error: 'Email type and email address are required'
        })
      }

      const success = await lifecycleEmailJob.testLifecycleEmail(type, email)

      res.json({
        success,
        message: success ? `Test ${type} email sent to ${email}` : 'Failed to send test email'
      })
    } catch (error) {
      console.error('Error sending test email:', error)
      res.status(500).json({
        success: false,
        error: 'Failed to send test email'
      })
    }
  })
}

/**
 * Process webhook events from email service providers
 */
async function processWebhookEvent(provider, event) {
  let messageId, eventType, email, timestamp

  // Parse event based on provider
  switch (provider) {
    case 'sendgrid':
      messageId = event.sg_message_id
      eventType = event.event
      email = event.email
      timestamp = new Date(event.timestamp * 1000)
      break
    case 'ses':
      messageId = event.mail?.messageId
      eventType = event.eventType?.toLowerCase()
      email = event.mail?.destination?.[0]
      timestamp = new Date(event.timestamp)
      break
    default:
      console.warn('Unknown email provider:', provider)
      return
  }

  if (!messageId || !eventType || !email) {
    console.warn('Incomplete webhook event data:', event)
    return
  }

  // Update email event status
  const { error } = await supabase
    .from('email_events')
    .update({
      status: mapEventType(eventType),
      updated_at: new Date().toISOString(),
      [`${mapEventType(eventType)}_at`]: timestamp.toISOString()
    })
    .eq('external_message_id', messageId)

  if (error) {
    console.error('Error updating email event:', error)
  } else {
    console.log(`Email event updated: ${email} - ${eventType}`)
  }
}

/**
 * Map provider-specific event types to our standard types
 */
function mapEventType(eventType) {
  switch (eventType) {
    case 'delivered':
    case 'delivery':
      return 'delivered'
    case 'open':
    case 'opened':
      return 'opened'
    case 'click':
    case 'clicked':
      return 'clicked'
    case 'bounce':
    case 'bounced':
      return 'bounced'
    case 'unsubscribe':
    case 'unsubscribed':
      return 'unsubscribed'
    default:
      return eventType
  }
}

export default router