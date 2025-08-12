import express from 'express'
import stripe, { STRIPE_CONFIG } from '../config/stripe.js'
import { supabase } from '../config/supabase.js'
import lifecycleEmailJob from '../jobs/lifecycleEmails.js'

const router = express.Router()

// Stripe webhook endpoint - must be raw body
router.post('/stripe', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_CONFIG.webhookSecret)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  console.log(`Processing webhook: ${event.type}`)

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object)
        break

      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object)
        break

      case 'invoice.paid':
        await handleInvoicePaid(event.data.object)
        break

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object)
        break

      case 'customer.subscription.trial_will_end':
        await handleTrialWillEnd(event.data.object)
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    res.json({ received: true })
  } catch (error) {
    console.error('Error processing webhook:', error)
    res.status(500).json({ error: 'Webhook processing failed' })
  }
})

/**
 * Handle subscription created/updated
 */
async function handleSubscriptionChange(subscription) {
  const { customer, id, status, current_period_start, current_period_end, trial_end, metadata, items } = subscription

  try {
    // Get customer to find user
    const stripeCustomer = await stripe.customers.retrieve(customer)
    const userId = stripeCustomer.metadata.userId

    if (!userId) {
      console.error('No userId found in customer metadata')
      return
    }

    // Get plan code from subscription items
    let planCode = metadata.planCode
    if (!planCode && items.data.length > 0) {
      // Try to determine plan from price ID
      const priceId = items.data[0].price.id
      planCode = Object.keys(STRIPE_CONFIG.prices).find(
        key => STRIPE_CONFIG.prices[key] === priceId
      )
    }

    if (!planCode) {
      console.error('Could not determine plan code from subscription')
      return
    }

    // Upsert subscription record
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .upsert({
        user_id: userId,
        plan_code: planCode,
        status,
        stripe_subscription_id: id,
        stripe_customer_id: customer,
        current_period_start: new Date(current_period_start * 1000).toISOString(),
        current_period_end: new Date(current_period_end * 1000).toISOString(),
        trial_end: trial_end ? new Date(trial_end * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_subscription_id'
      })

    if (subscriptionError) {
      console.error('Error upserting subscription:', subscriptionError)
      return
    }

    // Update user profile
    const { error: profileError } = await supabase
      .from('user_profiles')
      .update({
        subscription_tier: mapPlanCodeToTier(planCode),
        subscription_status: status,
        stripe_customer_id: customer,
        stripe_subscription_id: id,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    if (profileError) {
      console.error('Error updating user profile:', profileError)
    }

    // Trigger usage bucket creation/update
    await createOrUpdateUsageBucket(userId)

    // Trigger welcome email for new trial subscriptions
    if (status === 'trialing' && trial_end) {
      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('stripe_subscription_id', id)
        .single()

      if (!subError && subscription) {
        // Trigger welcome email after a small delay to ensure subscription is saved
        setTimeout(() => {
          lifecycleEmailJob.triggerWelcomeEmail(userId, subscription.id)
            .catch(error => console.error('Error triggering welcome email:', error))
        }, 2000)
      }
    }

    console.log(`Subscription ${id} processed successfully`)
  } catch (error) {
    console.error('Error handling subscription change:', error)
  }
}

/**
 * Handle subscription deleted
 */
async function handleSubscriptionDeleted(subscription) {
  const { id } = subscription

  try {
    // Update subscription status
    const { error: subscriptionError } = await supabase
      .from('subscriptions')
      .update({
        status: 'canceled',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', id)

    if (subscriptionError) {
      console.error('Error updating canceled subscription:', subscriptionError)
    }

    // Get user ID and update profile
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', id)
      .single()

    if (subscriptionData) {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          subscription_tier: 'free',
          subscription_status: 'canceled',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', subscriptionData.user_id)

      if (profileError) {
        console.error('Error updating user profile on cancellation:', profileError)
      }
    }

    console.log(`Subscription ${id} canceled successfully`)
  } catch (error) {
    console.error('Error handling subscription deletion:', error)
  }
}

/**
 * Handle checkout session completed
 */
async function handleCheckoutCompleted(session) {
  const { customer, metadata, mode, subscription: subscriptionId } = session

  try {
    if (mode === 'subscription') {
      // Subscription checkout - will be handled by subscription webhooks
      console.log(`Subscription checkout completed: ${subscriptionId}`)
    } else if (mode === 'payment') {
      // Add-on purchase
      const { userId, addonType } = metadata

      if (!userId || !addonType) {
        console.error('Missing metadata in checkout session')
        return
      }

      // Process addon purchase
      await processAddonPurchase(userId, addonType, session)
    }
  } catch (error) {
    console.error('Error handling checkout completion:', error)
  }
}

/**
 * Handle invoice paid
 */
async function handleInvoicePaid(invoice) {
  const { subscription: subscriptionId } = invoice

  if (!subscriptionId) return

  try {
    // Update subscription status to active
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription on invoice paid:', error)
    }

    console.log(`Invoice paid for subscription: ${subscriptionId}`)
  } catch (error) {
    console.error('Error handling invoice paid:', error)
  }
}

/**
 * Handle payment failed
 */
async function handlePaymentFailed(invoice) {
  const { subscription: subscriptionId } = invoice

  if (!subscriptionId) return

  try {
    // Update subscription status to past_due
    const { error } = await supabase
      .from('subscriptions')
      .update({
        status: 'past_due',
        updated_at: new Date().toISOString()
      })
      .eq('stripe_subscription_id', subscriptionId)

    if (error) {
      console.error('Error updating subscription on payment failure:', error)
    }

    console.log(`Payment failed for subscription: ${subscriptionId}`)
  } catch (error) {
    console.error('Error handling payment failure:', error)
  }
}

/**
 * Handle trial will end
 */
async function handleTrialWillEnd(subscription) {
  const { customer, id } = subscription

  try {
    // Get user from customer
    const stripeCustomer = await stripe.customers.retrieve(customer)
    const userId = stripeCustomer.metadata.userId

    if (!userId) {
      console.error('No userId found in customer metadata for trial end')
      return
    }

    // Trigger trial ending email
    await triggerTrialEndingEmail(userId, subscription)

    console.log(`Trial ending notification sent for subscription: ${id}`)
  } catch (error) {
    console.error('Error handling trial will end:', error)
  }
}

/**
 * Process addon purchase
 */
async function processAddonPurchase(userId, addonType, session) {
  const { amount_total } = session

  try {
    // Record addon purchase
    const { error: purchaseError } = await supabase
      .from('addon_purchases')
      .insert({
        user_id: userId,
        type: addonType,
        amount: getAddonAmount(addonType),
        price_paid: amount_total,
        stripe_payment_id: session.payment_intent,
      })

    if (purchaseError) {
      console.error('Error recording addon purchase:', purchaseError)
      return
    }

    // Update usage limits
    await updateUsageLimitsForAddon(userId, addonType)

    console.log(`Addon purchase processed: ${addonType} for user ${userId}`)
  } catch (error) {
    console.error('Error processing addon purchase:', error)
  }
}

/**
 * Create or update usage bucket
 */
async function createOrUpdateUsageBucket(userId) {
  try {
    const { error } = await supabase
      .rpc('get_current_usage_bucket', { user_uuid: userId })

    if (error) {
      console.error('Error creating/updating usage bucket:', error)
    }
  } catch (error) {
    console.error('Error in usage bucket operation:', error)
  }
}

/**
 * Update usage limits for addon
 */
async function updateUsageLimitsForAddon(userId, addonType) {
  try {
    // Get current usage bucket
    const { data: bucket, error: bucketError } = await supabase
      .rpc('get_current_usage_bucket', { user_uuid: userId })

    if (bucketError || !bucket) {
      console.error('Error getting usage bucket for addon:', bucketError)
      return
    }

    // Update limits based on addon type
    const updates = {}
    switch (addonType) {
      case 'CREDITS_500':
        updates.credits_limit = bucket.credits_limit + 500
        break
      case 'VIDEO_60':
        updates.video_minutes_limit = bucket.video_minutes_limit + 60
        break
      case 'POSTS_1000':
        updates.posts_limit = bucket.posts_limit + 1000
        break
      case 'BRAND':
        updates.brands_limit = bucket.brands_limit + 1
        break
      case 'SEAT':
        updates.seats_limit = bucket.seats_limit + 1
        break
    }

    if (Object.keys(updates).length > 0) {
      const { error: updateError } = await supabase
        .from('usage_buckets')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', bucket.id)

      if (updateError) {
        console.error('Error updating usage limits:', updateError)
      }
    }
  } catch (error) {
    console.error('Error updating usage limits for addon:', error)
  }
}

/**
 * Get addon amount
 */
function getAddonAmount(addonType) {
  const addonConfig = {
    CREDITS_500: 500,
    VIDEO_60: 60,
    POSTS_1000: 1000,
    BRAND: 1,
    SEAT: 1,
  }
  return addonConfig[addonType] || 0
}

/**
 * Map plan code to tier
 */
function mapPlanCodeToTier(planCode) {
  const tierMap = {
    STARTER: 'starter',
    PRO_50: 'pro',
    PRO_200: 'pro',
    PRO_500: 'pro',
    AGENCY: 'agency',
  }
  return tierMap[planCode] || 'free'
}

/**
 * Trigger trial ending email
 */
async function triggerTrialEndingEmail(userId, subscription) {
  try {
    // Get user email
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('email, first_name')
      .eq('user_id', userId)
      .single()

    if (!userProfile) return

    // Log analytics event
    await supabase
      .from('analytics_events')
      .insert({
        user_id: userId,
        event_name: 'trial_will_end_notification',
        event_properties: {
          subscription_id: subscription.id,
          trial_end: new Date(subscription.trial_end * 1000).toISOString()
        }
      })

    // TODO: Send email via your email service
    console.log(`Trial ending email triggered for ${userProfile.email}`)
  } catch (error) {
    console.error('Error triggering trial ending email:', error)
  }
}

export default router