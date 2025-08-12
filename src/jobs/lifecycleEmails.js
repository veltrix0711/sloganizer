import { supabase } from '../config/supabase.js'
import emailService from '../services/emailService.js'
import cron from 'node-cron'

class LifecycleEmailJob {
  constructor() {
    this.isRunning = false
    this.init()
  }

  init() {
    // Run every hour to check for lifecycle email triggers
    cron.schedule('0 * * * *', () => {
      this.processLifecycleEmails()
    })

    console.log('Lifecycle email job scheduled to run hourly')
  }

  async processLifecycleEmails() {
    if (this.isRunning) {
      console.log('Lifecycle email job already running, skipping...')
      return
    }

    this.isRunning = true
    console.log('Processing lifecycle emails...')

    try {
      await Promise.all([
        this.sendWelcomeEmails(),
        this.sendTrialReminders(),
        this.sendFinalReminders(),
        this.sendConversionEmails()
      ])
    } catch (error) {
      console.error('Error processing lifecycle emails:', error)
    } finally {
      this.isRunning = false
    }
  }

  /**
   * Send welcome emails for new trial users
   */
  async sendWelcomeEmails() {
    try {
      // Find users who started trial in last 2 hours and haven't received welcome email
      const { data: newTrialUsers, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user_profiles!inner(*)
        `)
        .eq('status', 'trialing')
        .gte('trial_start', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Last 2 hours
        .is('welcome_email_sent', null)

      if (error) throw error

      console.log(`Found ${newTrialUsers?.length || 0} users for welcome emails`)

      for (const subscription of newTrialUsers || []) {
        try {
          const user = subscription.user_profiles

          await emailService.sendTrialWelcomeEmail(user, subscription)

          // Mark welcome email as sent
          await supabase
            .from('subscriptions')
            .update({ 
              welcome_email_sent: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id)

          console.log(`Welcome email sent to ${user.email}`)

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`Failed to send welcome email to ${subscription.user_profiles?.email}:`, error)
        }
      }
    } catch (error) {
      console.error('Error sending welcome emails:', error)
    }
  }

  /**
   * Send trial reminder emails (3 days before expiration)
   */
  async sendTrialReminders() {
    try {
      // Find users whose trial ends in 3 days and haven't received reminder
      const reminderDate = new Date()
      reminderDate.setDate(reminderDate.getDate() + 3)

      const { data: reminderUsers, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user_profiles!inner(*)
        `)
        .eq('status', 'trialing')
        .gte('trial_end', reminderDate.toISOString())
        .lt('trial_end', new Date(reminderDate.getTime() + 24 * 60 * 60 * 1000).toISOString()) // Within 24 hours of 3 days
        .is('trial_reminder_sent', null)

      if (error) throw error

      console.log(`Found ${reminderUsers?.length || 0} users for trial reminders`)

      for (const subscription of reminderUsers || []) {
        try {
          const user = subscription.user_profiles
          const daysLeft = Math.ceil((new Date(subscription.trial_end) - new Date()) / (1000 * 60 * 60 * 24))

          await emailService.sendTrialReminderEmail(user, subscription, Math.max(daysLeft, 1))

          // Mark reminder email as sent
          await supabase
            .from('subscriptions')
            .update({ 
              trial_reminder_sent: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id)

          console.log(`Trial reminder sent to ${user.email}`)

          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`Failed to send trial reminder to ${subscription.user_profiles?.email}:`, error)
        }
      }
    } catch (error) {
      console.error('Error sending trial reminders:', error)
    }
  }

  /**
   * Send final reminder emails (1 day before expiration)
   */
  async sendFinalReminders() {
    try {
      // Find users whose trial ends in 1 day and haven't received final reminder
      const finalReminderDate = new Date()
      finalReminderDate.setDate(finalReminderDate.getDate() + 1)

      const { data: finalReminderUsers, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user_profiles!inner(*)
        `)
        .eq('status', 'trialing')
        .gte('trial_end', finalReminderDate.toISOString())
        .lt('trial_end', new Date(finalReminderDate.getTime() + 12 * 60 * 60 * 1000).toISOString()) // Within 12 hours of 1 day
        .is('final_reminder_sent', null)

      if (error) throw error

      console.log(`Found ${finalReminderUsers?.length || 0} users for final reminders`)

      for (const subscription of finalReminderUsers || []) {
        try {
          const user = subscription.user_profiles

          await emailService.sendTrialFinalReminderEmail(user, subscription)

          // Mark final reminder as sent
          await supabase
            .from('subscriptions')
            .update({ 
              final_reminder_sent: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id)

          console.log(`Final reminder sent to ${user.email}`)

          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`Failed to send final reminder to ${subscription.user_profiles?.email}:`, error)
        }
      }
    } catch (error) {
      console.error('Error sending final reminders:', error)
    }
  }

  /**
   * Send conversion emails for users who converted from trial to paid
   */
  async sendConversionEmails() {
    try {
      // Find subscriptions that converted from trial to paid in last 2 hours
      const { data: convertedUsers, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user_profiles!inner(*)
        `)
        .eq('status', 'active')
        .not('trial_end', 'is', null) // Had a trial
        .gte('updated_at', new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()) // Updated in last 2 hours
        .is('conversion_email_sent', null)

      if (error) throw error

      console.log(`Found ${convertedUsers?.length || 0} users for conversion emails`)

      for (const subscription of convertedUsers || []) {
        try {
          const user = subscription.user_profiles

          await emailService.sendTrialConversionEmail(user, subscription)

          // Mark conversion email as sent
          await supabase
            .from('subscriptions')
            .update({ 
              conversion_email_sent: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .eq('id', subscription.id)

          console.log(`Conversion email sent to ${user.email}`)

          await new Promise(resolve => setTimeout(resolve, 1000))

        } catch (error) {
          console.error(`Failed to send conversion email to ${subscription.user_profiles?.email}:`, error)
        }
      }
    } catch (error) {
      console.error('Error sending conversion emails:', error)
    }
  }

  /**
   * Trigger immediate welcome email (called from webhook or API)
   */
  async triggerWelcomeEmail(userId, subscriptionId) {
    try {
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select(`
          *,
          user_profiles!inner(*)
        `)
        .eq('id', subscriptionId)
        .eq('user_id', userId)
        .single()

      if (error) throw error

      const user = subscription.user_profiles

      await emailService.sendTrialWelcomeEmail(user, subscription)

      // Mark welcome email as sent
      await supabase
        .from('subscriptions')
        .update({ 
          welcome_email_sent: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', subscription.id)

      console.log(`Welcome email triggered for ${user.email}`)
      return true

    } catch (error) {
      console.error('Error triggering welcome email:', error)
      return false
    }
  }

  /**
   * Manual trigger for testing lifecycle emails
   */
  async testLifecycleEmail(type, email) {
    try {
      const { data: user, error: userError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('email', email)
        .single()

      if (userError) throw userError

      const { data: subscription, error: subError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.user_id)
        .single()

      if (subError) throw subError

      switch (type) {
        case 'welcome':
          await emailService.sendTrialWelcomeEmail(user, subscription)
          break
        case 'reminder':
          await emailService.sendTrialReminderEmail(user, subscription, 3)
          break
        case 'final':
          await emailService.sendTrialFinalReminderEmail(user, subscription)
          break
        case 'conversion':
          await emailService.sendTrialConversionEmail(user, subscription)
          break
        default:
          throw new Error('Invalid email type')
      }

      console.log(`Test ${type} email sent to ${email}`)
      return true

    } catch (error) {
      console.error(`Error sending test ${type} email:`, error)
      return false
    }
  }
}

export default new LifecycleEmailJob()