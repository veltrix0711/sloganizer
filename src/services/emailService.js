import nodemailer from 'nodemailer'

class EmailService {
  constructor() {
    this.transporter = null
    this.init()
  }

  init() {
    // Configure based on environment
    if (process.env.EMAIL_PROVIDER === 'sendgrid') {
      this.transporter = nodemailer.createTransporter({
        service: 'SendGrid',
        auth: {
          user: 'apikey',
          pass: process.env.SENDGRID_API_KEY
        }
      })
    } else if (process.env.EMAIL_PROVIDER === 'ses') {
      this.transporter = nodemailer.createTransporter({
        SES: {
          aws: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            region: process.env.AWS_REGION || 'us-east-1'
          }
        }
      })
    } else {
      // Development/testing with SMTP
      this.transporter = nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'localhost',
        port: process.env.SMTP_PORT || 587,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      })
    }
  }

  /**
   * Send welcome email when user starts trial
   */
  async sendTrialWelcomeEmail(user, subscription) {
    const trialEndDate = new Date(subscription.trial_end).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to LaunchZone!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0B1220; color: #B9C7D9; }
          .container { max-width: 600px; margin: 0 auto; background: #0F1B2E; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #00E5A8 0%, #1FB5FF 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .welcome-text { font-size: 18px; line-height: 1.6; color: #EAF2FF; margin-bottom: 30px; }
          .trial-info { background: #1FB5FF15; border: 1px solid #1FB5FF30; border-radius: 8px; padding: 20px; margin: 30px 0; }
          .trial-info h3 { color: #1FB5FF; margin-top: 0; }
          .features { margin: 30px 0; }
          .feature { display: flex; align-items: flex-start; margin-bottom: 15px; }
          .feature-icon { color: #00E5A8; margin-right: 10px; font-weight: bold; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FF7A00 0%, #1FB5FF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #0B1220; padding: 30px; text-align: center; font-size: 14px; color: #7F8CA0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚀 Welcome to LaunchZone!</h1>
          </div>
          
          <div class="content">
            <div class="welcome-text">
              Hi ${user.name || 'there'},<br><br>
              
              Welcome to LaunchZone! We're thrilled to have you on board. Your free trial has started, and you now have access to our complete brand-building toolkit.
            </div>

            <div class="trial-info">
              <h3>Your 7-Day Trial Details</h3>
              <p><strong>Plan:</strong> Starter Pack</p>
              <p><strong>Trial ends:</strong> ${trialEndDate}</p>
              <p><strong>What happens next:</strong> After your trial, you'll be charged $9.99/month. Cancel anytime before then.</p>
            </div>

            <h3 style="color: #EAF2FF;">What you can do right now:</h3>
            <div class="features">
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Create your first brand kit with colors, fonts, and logos</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Generate 200 AI-powered posts and slogans</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Connect up to 5 social media accounts</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Schedule content with our Smart Scheduler</span>
              </div>
              <div class="feature">
                <span class="feature-icon">✓</span>
                <span>Access basic analytics and insights</span>
              </div>
            </div>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">
                Start Building Your Brand →
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 16px;">
              Need help getting started? Reply to this email or check out our <a href="${process.env.FRONTEND_URL}/help" style="color: #1FB5FF;">quick start guide</a>.
            </p>
          </div>

          <div class="footer">
            <p>LaunchZone - Your Brand Command Center</p>
            <p>
              <a href="${process.env.FRONTEND_URL}/unsubscribe" style="color: #7F8CA0;">Unsubscribe</a> | 
              <a href="${process.env.FRONTEND_URL}/support" style="color: #7F8CA0;">Support</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: user.email,
      subject: '🚀 Welcome to LaunchZone - Your 7-day trial has started!',
      html: htmlContent
    })
  }

  /**
   * Send reminder email 3 days before trial ends
   */
  async sendTrialReminderEmail(user, subscription, daysLeft) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Your LaunchZone trial ends in ${daysLeft} days</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0B1220; color: #B9C7D9; }
          .container { max-width: 600px; margin: 0 auto; background: #0F1B2E; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #FF7A00 0%, #00E5A8 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .warning-box { background: #FF7A0015; border: 1px solid #FF7A0030; border-radius: 8px; padding: 20px; margin: 30px 0; }
          .warning-box h3 { color: #FF7A00; margin-top: 0; }
          .usage-stats { background: #0B1220; border-radius: 8px; padding: 20px; margin: 30px 0; }
          .stat { display: flex; justify-content: space-between; margin-bottom: 10px; }
          .stat-label { color: #B9C7D9; }
          .stat-value { color: #00E5A8; font-weight: bold; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FF7A00 0%, #1FB5FF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 10px; }
          .secondary-button { display: inline-block; background: transparent; color: #1FB5FF; text-decoration: none; padding: 15px 30px; border: 1px solid #1FB5FF; border-radius: 8px; font-weight: bold; margin: 20px 10px; }
          .footer { background: #0B1220; padding: 30px; text-align: center; font-size: 14px; color: #7F8CA0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>⏰ Trial Ending Soon</h1>
          </div>
          
          <div class="content">
            <div style="font-size: 18px; line-height: 1.6; color: #EAF2FF; margin-bottom: 30px;">
              Hi ${user.name || 'there'},<br><br>
              
              Your LaunchZone trial ends in <strong>${daysLeft} days</strong>. We hope you've been enjoying building your brand with our platform!
            </div>

            <div class="warning-box">
              <h3>Don't lose your progress</h3>
              <p>After your trial ends, you'll lose access to your brand kits, scheduled posts, and analytics unless you continue with a paid plan.</p>
            </div>

            <h3 style="color: #EAF2FF;">Your trial activity:</h3>
            <div class="usage-stats">
              <div class="stat">
                <span class="stat-label">Posts created:</span>
                <span class="stat-value">-</span>
              </div>
              <div class="stat">
                <span class="stat-label">AI credits used:</span>
                <span class="stat-value">-</span>
              </div>
              <div class="stat">
                <span class="stat-label">Brand kits created:</span>
                <span class="stat-value">-</span>
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <a href="${process.env.FRONTEND_URL}/pricing" class="cta-button">
                Continue for $9.99/month →
              </a>
              <a href="${process.env.FRONTEND_URL}/pricing" class="secondary-button">
                View All Plans
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 16px; text-align: center;">
              Questions? <a href="mailto:support@launchzone.com" style="color: #1FB5FF;">Email us</a> or 
              <a href="${process.env.FRONTEND_URL}/contact-sales" style="color: #1FB5FF;">schedule a call</a>
            </p>
          </div>

          <div class="footer">
            <p>LaunchZone - Your Brand Command Center</p>
            <p>No commitment - Cancel anytime in your account settings</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: user.email,
      subject: `⏰ Your LaunchZone trial ends in ${daysLeft} days`,
      html: htmlContent
    })
  }

  /**
   * Send final reminder email 1 day before trial ends
   */
  async sendTrialFinalReminderEmail(user, subscription) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Last chance - Your LaunchZone trial ends tomorrow</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0B1220; color: #B9C7D9; }
          .container { max-width: 600px; margin: 0 auto; background: #0F1B2E; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #FF7A00 0%, #FF0000 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .urgent-box { background: #FF000015; border: 1px solid #FF000030; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; }
          .urgent-box h3 { color: #FF4444; margin-top: 0; font-size: 24px; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FF7A00 0%, #1FB5FF 100%); color: white; text-decoration: none; padding: 20px 40px; border-radius: 8px; font-weight: bold; font-size: 18px; margin: 20px 0; }
          .footer { background: #0B1220; padding: 30px; text-align: center; font-size: 14px; color: #7F8CA0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🚨 Last Chance!</h1>
          </div>
          
          <div class="content">
            <div style="font-size: 18px; line-height: 1.6; color: #EAF2FF; margin-bottom: 30px;">
              Hi ${user.name || 'there'},<br><br>
              
              This is your final reminder - your LaunchZone trial ends <strong>tomorrow</strong>.
            </div>

            <div class="urgent-box">
              <h3>Don't lose everything!</h3>
              <p style="color: #EAF2FF; font-size: 16px;">Your brand kits, posts, and scheduled content will be lost unless you continue with a paid plan.</p>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <h3 style="color: #EAF2FF;">Continue for just $9.99/month</h3>
              <p style="color: #B9C7D9;">Keep everything you've built + unlock more features</p>
              
              <a href="${process.env.FRONTEND_URL}/pricing" class="cta-button">
                Save My Brand Work →
              </a>
            </div>

            <div style="background: #0B1220; border-radius: 8px; padding: 20px; margin: 30px 0;">
              <h4 style="color: #00E5A8; margin-top: 0;">What you'll keep:</h4>
              <ul style="color: #B9C7D9; line-height: 1.8;">
                <li>All your brand kits and logos</li>
                <li>Generated slogans and copy</li>
                <li>Scheduled social media posts</li>
                <li>Analytics and insights</li>
                <li>Account settings and preferences</li>
              </ul>
            </div>

            <p style="text-align: center; color: #7F8CA0; font-size: 14px;">
              Need more time to decide? <a href="${process.env.FRONTEND_URL}/contact-sales" style="color: #1FB5FF;">Contact our team</a> - we're here to help.
            </p>
          </div>

          <div class="footer">
            <p>LaunchZone - Your Brand Command Center</p>
            <p>Cancel anytime in your account settings - No long-term commitment</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: user.email,
      subject: '🚨 Last chance - Your LaunchZone trial ends tomorrow!',
      html: htmlContent
    })
  }

  /**
   * Send email when trial expires and converts to paid
   */
  async sendTrialConversionEmail(user, subscription) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to LaunchZone Premium!</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background: #0B1220; color: #B9C7D9; }
          .container { max-width: 600px; margin: 0 auto; background: #0F1B2E; border-radius: 12px; overflow: hidden; }
          .header { background: linear-gradient(135deg, #00E5A8 0%, #1FB5FF 100%); padding: 40px 30px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
          .content { padding: 40px 30px; }
          .success-box { background: #00E5A815; border: 1px solid #00E5A830; border-radius: 8px; padding: 20px; margin: 30px 0; text-align: center; }
          .success-box h3 { color: #00E5A8; margin-top: 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #FF7A00 0%, #1FB5FF 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .footer { background: #0B1220; padding: 30px; text-align: center; font-size: 14px; color: #7F8CA0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to Premium!</h1>
          </div>
          
          <div class="content">
            <div style="font-size: 18px; line-height: 1.6; color: #EAF2FF; margin-bottom: 30px;">
              Hi ${user.name || 'there'},<br><br>
              
              Congratulations! Your trial has converted to a paid subscription. You now have full access to LaunchZone Premium.
            </div>

            <div class="success-box">
              <h3>Your subscription is active</h3>
              <p><strong>Plan:</strong> Starter Pack ($9.99/month)</p>
              <p><strong>Next billing:</strong> ${new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}</p>
            </div>

            <h3 style="color: #EAF2FF;">What's next?</h3>
            <p>Now that you're a premium member, you can:</p>
            <ul style="color: #B9C7D9; line-height: 1.8;">
              <li>Create unlimited brand variations</li>
              <li>Export content without watermarks</li>
              <li>Access priority support</li>
              <li>Get early access to new features</li>
            </ul>

            <div style="text-align: center;">
              <a href="${process.env.FRONTEND_URL}/dashboard" class="cta-button">
                Continue Building →
              </a>
            </div>

            <p style="margin-top: 30px; font-size: 16px;">
              Questions about your subscription? <a href="${process.env.FRONTEND_URL}/billing" style="color: #1FB5FF;">Manage billing</a> or 
              <a href="mailto:support@launchzone.com" style="color: #1FB5FF;">contact support</a>.
            </p>
          </div>

          <div class="footer">
            <p>LaunchZone - Your Brand Command Center</p>
            <p>Manage your subscription anytime in account settings</p>
          </div>
        </div>
      </body>
      </html>
    `

    return this.sendEmail({
      to: user.email,
      subject: '🎉 Welcome to LaunchZone Premium!',
      html: htmlContent
    })
  }

  /**
   * Core email sending method
   */
  async sendEmail({ to, subject, html, text = null }) {
    if (!this.transporter) {
      console.error('Email transporter not configured')
      return false
    }

    try {
      const mailOptions = {
        from: process.env.FROM_EMAIL || 'LaunchZone <noreply@launchzone.com>',
        to,
        subject,
        html,
        text: text || this.htmlToText(html)
      }

      const result = await this.transporter.sendMail(mailOptions)
      console.log('Email sent successfully:', result.messageId)
      return true
    } catch (error) {
      console.error('Failed to send email:', error)
      return false
    }
  }

  /**
   * Simple HTML to text conversion for fallback
   */
  htmlToText(html) {
    return html
      .replace(/<[^>]*>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()
  }
}

export default new EmailService()