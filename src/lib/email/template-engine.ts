/**
 * @file template-engine.ts
 * @description Dynamic template engine for email content rendering with HTML/text support and variable substitution
 */

import { logger } from '../../logger'

export interface TemplateData {
  [key: string]: any
}

export interface TemplateOptions {
  template: string
  html?: string
  text?: string
  preview?: boolean
}

export interface TemplateRenderResult {
  html: string
  text: string
  metadata?: {
    variables?: string[]
    renderingTime?: number
  }
}

export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

export interface Template {
  id: number
  name: string
  subject: string
  htmlContent: string
  textContent: string
  variables: Record<string, {
    type: 'string' | 'number' | 'boolean' | 'object'
    required: boolean
    description: string
  }>
  isActive: boolean
  version: number
  createdAt: Date
  updatedAt: Date
}

export class TemplateEngine {
  private templates: Map<string, Template> = new Map()

  constructor() {
    this.loadBuiltinTemplates()
  }

  /**
   * Load built-in templates
   */
  private loadBuiltinTemplates(): void {
    // Password reset template
    this.templates.set('password-reset', {
      id: 'password-reset',
      name: 'Password Reset',
      subject: 'Password Reset - The Tech Deputies',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Password Reset - The Tech Deputies</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f9f9f9; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #ffffff; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .logo { 
              color: #39918C; 
              font-size: 24px; 
              font-weight: bold; 
            }
            .content { 
              background-color: #f9f9f9; 
              padding: 30px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .button { 
              display: inline-block; 
              background-color: #39918C; 
              color: #ffffff; 
              padding: 12px 24px; 
              text-decoration: none; 
              border-radius: 6px; 
              margin: 20px 0; 
            }
            .reason { 
              background-color: #fff3cd; 
              border-left: 4px solid #ffc107; 
              padding: 10px; 
              margin: 15px 0; 
            }
            .footer { 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">The Tech Deputies</div>
              <h1>Password Reset Request</h1>
            </div>
            
            <div class="content">
              <p>Hello {{userName}}</p>
              
              {{#if reason}}
              <div class="reason">
                <strong>Reason:</strong> {{reason}}
              </div>
              {{/if}}
              
              <p>Click the button below to reset your password:</p>
              
              <a href="{{resetUrl}}" class="button">Reset Password</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all; background: #eee; padding: 10px; border-radius: 4px;">
                {{resetUrl}}
              </p>
              
              <p><strong>Important:</strong></p>
              <ul>
                <li>This link will expire in 24 hours</li>
                <li>If you didn't request this reset, please contact us immediately</li>
                <li>Never share this link with anyone</li>
              </ul>
            </div>
            
            <div class="footer">
              <p>This is an automated message from The Tech Deputies.</p>
              <p>If you have questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Password Reset Request - The Tech Deputies
        
        Hello {{userName}}
        
        A password reset has been requested for your account at The Tech Deputies.
        
        {{#if reason}}
        Reason: {{reason}}
        
        {{/if}}
        
        Click this link to reset your password:
        {{resetUrl}}
        
        Important:
        - This link will expire in 24 hours
        - If you didn't request this reset, please contact us immediately
        - Never share this link with anyone
        
        This is an automated message from The Tech Deputies.
      `
    })

    // Admin notification template
    this.templates.set('admin-notification', {
      id: 'admin-notification',
      name: 'Admin Action Notification',
      subject: 'Admin Action - The Tech Deputies',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Admin Action Notification - The Tech Deputies</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f9f9f9; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #ffffff; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .logo { 
              color: #39918C; 
              font-size: 24px; 
              font-weight: bold; 
            }
            .content { 
              background-color: #f9f9f9; 
              padding: 30px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .action-type { 
              background-color: #e3f2fd; 
              border-left: 4px solid #2196f3; 
              padding: 15px; 
              margin: 15px 0; 
            }
            .details { 
              background-color: #f5f5f5; 
              padding: 15px; 
              border-radius: 4px; 
              font-family: monospace; 
              font-size: 12px; 
            }
            .footer { 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">The Tech Deputies</div>
              <h1>Admin Action Notification</h1>
            </div>
            
            <div class="content">
              <p>Hello {{adminName}}</p>
              
              <p>An administrative action was performed on The Tech Deputies platform:</p>
              
              <div class="action-type">
                <strong>Action:</strong> {{action}}<br>
                <strong>Target User:</strong> {{targetUser.email}}<br>
                <strong>Timestamp:</strong> {{timestamp}}
              </div>
              
              {{#if targetUser.name}}
              <p><strong>Target Name:</strong> {{targetUser.name}}</p>
              {{/if}}
              
              {{#if details}}
              <h3>Details:</h3>
              <div class="details">
                {{#each details}}
                {{this}}: {{@../this}}
                {{/each}}
              </div>
              {{/if}}
              
              <p>If this action was not authorized, please contact our security team immediately.</p>
            </div>
            
            <div class="footer">
              <p>This is an automated security notification from The Tech Deputies.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Admin Action Notification - The Tech Deputies
        
        Hello {{adminName}}
        
        An administrative action was performed on The Tech Deputies platform:
        
        Action: {{action}}
        Target User: {{targetUser.email}}
        Timestamp: {{timestamp}}
        
        {{#if targetUser.name}}
        Target Name: {{targetUser.name}}
        {{/if}}
        
        {{#if details}}
        Details:
        {{#each details}}
        {{this}}: {{@../this}}
        {{/each}}
        
        {{/if}}
        
        If this action was not authorized, please contact our security team immediately.
        
        This is an automated security notification from The Tech Deputies.
      `
    })

    // Welcome template
    this.templates.set('welcome', {
      id: 'welcome',
      name: 'Welcome',
      subject: 'Welcome to The Tech Deputies',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to The Tech Deputies</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f9f9f9; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #ffffff; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .logo { 
              color: #39918C; 
              font-size: 24px; 
              font-weight: bold; 
            }
            .content { 
              background-color: #f9f9f9; 
              padding: 30px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .footer { 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">The Tech Deputies</div>
              <h1>Welcome to The Tech Deputies</h1>
            </div>
            
            <div class="content">
              <p>Hello {{userName}},</p>
              
              <p>Thank you for joining The Tech Deputies! We're excited to have you as part of our community.</p>
              
              <p>Your account is now active and you can access all the features and resources available to you.</p>
              
              <p>Best regards,<br>The Tech Deputies Team</p>
            </div>
            
            <div class="footer">
              <p>This is an automated message from The Tech Deputies.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Welcome to The Tech Deputies
        
        Hello {{userName}},
        
        Thank you for joining The Tech Deputies! We're excited to have you as part of our community.
        
        Your account is now active and you can access all the features and resources available to you.
        
        Best regards,
        The Tech Deputies Team
      `
    })

    // Course purchase template
    this.templates.set('course-purchase', {
      id: 'course-purchase',
      name: 'Course Purchase',
      subject: 'Course Purchase Confirmation - The Tech Deputies',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Course Purchase Confirmation - The Tech Deputies</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f9f9f9; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #ffffff; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .logo { 
              color: #39918C; 
              font-size: 24px; 
              font-weight: bold; 
            }
            .content { 
              background-color: #f9f9f9; 
              padding: 30px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .course-info { 
              background-color: #e3f2fd; 
              border-radius: 8px; 
              padding: 20px; 
              margin-bottom: 20px; 
            }
            .purchase-details { 
              background-color: #f5f5f5; 
              border-radius: 8px; 
              padding: 15px; 
              margin-bottom: 20px; 
            }
            .footer { 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">The Tech Deputies</div>
              <h1>Course Purchase Confirmation</h1>
            </div>
            
            <div class="content">
              <p>Dear {{userName}},</p>
              
              <p>Thank you for purchasing <strong>{{courseName}}</strong>! Your payment has been successfully processed.</p>
              
              <div class="course-info">
                <h3>Course Details</h3>
                <p><strong>Course:</strong> {{courseName}}</p>
                <p><strong>Price:</strong> ${{price}}</p>
                <p><strong>Payment Method:</strong> {{paymentMethod}}</p>
                {{#if giftCardCode}}
                <p><strong>Gift Card:</strong> {{giftCardCode}}</p>
                {{/if}}
                <p><strong>Purchase Date:</strong> {{purchaseDate}}</p>
              </div>
              
              <div class="purchase-details">
                <h3>Transaction Details</h3>
                <p><strong>Transaction ID:</strong> {{transactionId}}</p>
                <p><strong>Amount Paid:</strong> ${{amountPaid}}</p>
                {{#if giftCardCode}}
                <p><strong>Gift Card Applied:</strong> ${{giftCardAmount}}</p>
                {{/if}}
              </div>
              
              <p>You can access your course immediately by visiting your dashboard:</p>
              <p><a href="{{courseUrl}}" style="color: #39918C;">Go to Course</a></p>
              
              <p>If you have any questions or need support, please don't hesitate to contact us.</p>
              
              <div class="footer">
                <p>Thank you for choosing The Tech Deputies!</p>
                <p>Best regards,<br>The Tech Deputies Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Course Purchase Confirmation - The Tech Deputies
        
        Dear {{userName}},
        
        Thank you for purchasing {{courseName}}! Your payment has been successfully processed.
        
        Course Details:
        Course: {{courseName}}
        Price: ${{price}}
        Payment Method: {{paymentMethod}}
        {{#if giftCardCode}}
        Gift Card: {{giftCardCode}}
        {{/if}}
        Purchase Date: {{purchaseDate}}
        
        Transaction Details:
        Transaction ID: {{transactionId}}
        Amount Paid: ${{amountPaid}}
        {{#if giftCardCode}}
        Gift Card Applied: ${{giftCardAmount}}
        {{/if}}
        
        You can access your course immediately by visiting your dashboard:
        Go to Course: {{courseUrl}}
        
        If you have any questions or need support, please don't hesitate to contact us.
        
        Thank you for choosing The Tech Deputies!
        Best regards,
        The Tech Deputies Team
      `
    })

    // Gift card template
    this.templates.set('gift-card', {
      id: 'gift-card',
      name: 'Gift Card',
      subject: 'Gift Card Confirmation - The Tech Deputies',
      htmlContent: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Gift Card Confirmation - The Tech Deputies</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
              line-height: 1.6; 
              color: #333; 
              background-color: #f9f9f9; 
              margin: 0; 
              padding: 20px; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              padding: 20px; 
              background-color: #ffffff; 
              border-radius: 8px; 
              box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
            }
            .header { 
              text-align: center; 
              margin-bottom: 30px; 
            }
            .logo { 
              color: #39918C; 
              font-size: 24px; 
              font-weight: bold; 
            }
            .content { 
              background-color: #f9f9f9; 
              padding: 30px; 
              border-radius: 8px; 
              margin-bottom: 20px; 
            }
            .gift-card { 
              background-color: #e3f2fd; 
              border: 2px dashed #39918C; 
              border-radius: 8px; 
              padding: 20px; 
              margin-bottom: 20px; 
              text-align: center; 
              font-size: 18px; 
              font-weight: bold; 
            }
            .gift-info { 
              margin-top: 15px; 
            }
            .footer { 
              text-align: center; 
              font-size: 12px; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo">The Tech Deputies</div>
              <h1>Gift Card Confirmation</h1>
            </div>
            
            <div class="content">
              <p>Dear {{purchaserName}},</p>
              
              <p>Thank you for purchasing a <strong>The Tech Deputies gift card</strong>!</p>
              
              <div class="gift-card">
                <p><strong>Gift Card Code:</strong> {{code}}</p>
                <p><strong>Gift Card Amount:</strong> ${{amount}}</p>
                <p><strong>Original Amount:</strong> ${{originalAmount}}</p>
                <p><strong>Purchaser Name:</strong> {{purchaserName}}</p>
                <p><strong>Recipient Name:</strong> {{recipientName}}</p>
                <p><strong>Purchase Date:</strong> {{purchaseDate}}</p>
                <p><strong>Expiry Date:</strong> {{expiryDate}}</p>
              </div>
              
              <div class="gift-info">
                <p><strong>How to Use:</strong></p>
                <ol>
                  <li>Use this code at checkout: <code>{{code}}</code></li>
                  <li>Enter the code in your account dashboard</li>
                  <li>Share the gift card with friends and family</li>
                  <li>Valid for any course on our platform</li>
                  <li>One-time use per course</li>
                  <li>Cannot be combined with other discounts</li>
                </ol>
              </div>
              
              <div class="footer">
                <p>This gift card has been added to your account and is ready to use!</p>
                <p>If you have any questions about your gift card, please contact our support team.</p>
                <p>Best regards,<br>The Tech Deputies Team</p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      textContent: `
        Gift Card Confirmation - The Tech Deputies
        
        Dear {{purchaserName}},
        
        Thank you for purchasing a The Tech Deputies gift card!
        
        Gift Card Code: {{code}}
        Gift Card Amount: ${{amount}}
        Original Amount: ${{originalAmount}}
        Purchaser Name: {{purchaserName}}
        Recipient Name: {{recipientName}}
        Purchase Date: {{purchaseDate}}
        Expiry Date: {{expiryDate}}
        
        How to Use:
        - Use this code at checkout: {{code}}
        - Enter the code in your account dashboard
        - Share the gift card with friends and family
        - Valid for any course on our platform
        - One-time use per course
        - Cannot be combined with other discounts
        
        This gift card has been added to your account and is ready to use!
        
        If you have any questions about your gift card, please contact our support team.
        
        Best regards,
        The Tech Deputies Team
      `
    })
  }

  /**
   * Render template with variable substitution
   */
  async renderTemplate(templateName: string, data: Record<string, any>, options: TemplateOptions = {}): Promise<TemplateRenderResult> {
    const startTime = Date.now()
    
    try {
      const template = this.templates.get(templateName)
      if (!template) {
        throw new Error(`Template '${templateName}' not found`)
      }

      // Validate template data against requirements
      const validation = this.validateTemplateData(template, data)
      if (!validation.isValid) {
        return {
          html: '',
          text: '',
          metadata: {
            errors: validation.errors,
            warnings: validation.warnings
          }
        }
      }

      // Render HTML content
      const html = this.renderHTML(template.htmlContent, data)
      
      // Render text content
      const text = this.renderTextContent(template.textContent || '', data)

      const endTime = Date.now()
      
      logger.info('Template rendered successfully', {
        template: templateName,
        renderingTime: endTime - startTime,
        variables: Object.keys(data)
      })

      return {
        html,
        text,
        metadata: {
          variables: Object.keys(data),
          renderingTime: endTime - startTime
        }
      }
    } catch (error) {
      logger.error('Template rendering failed', error, {
        template: templateName,
        data: Object.keys(data)
      })
      
      return {
        html: '',
        text: '',
        metadata: {
          errors: [`Rendering failed: ${error.message}`],
          warnings: []
        }
      }
    }
  }

  /**
   * Render HTML content with variable substitution
   */
  private renderHTML(template: string, data: Record<string, any>): string {
    let rendered = template

    // Simple variable substitution (handlebars-like)
    Object.keys(data).forEach(key => {
      const value = data[key]
      const regex = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(regex, String(value))
    })

    return rendered
  }

  /**
   * Render text content with variable substitution
   */
  private renderTextContent(template: string, data: Record<string, any>): string {
    let rendered = template

    // Simple variable substitution
    Object.keys(data).forEach(key => {
      const value = data[key]
      const regex = new RegExp(`{{${key}}}`, 'g')
      rendered = rendered.replace(regex, String(value))
    })

    return rendered
  }

  /**
   * Validate template data against requirements
   */
  private validateTemplateData(template: Template, data: Record<string, any>): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // Check required variables
    if (template.variables) {
      template.variables.forEach(variable => {
        if (variable.required && !data[variable.key]) {
          errors.push(`Required variable '${variable.key}' is missing`)
        }
        
        // Validate variable type
        if (data[variable.key] && variable.type) {
          const actualType = typeof data[variable.key]
          const expectedType = variable.type
          
          if (actualType !== expectedType) {
            errors.push(`Variable '${variable.key}' should be of type '${expectedType}' but is '${actualType}'`)
          }
        }
      })
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): string[] {
    return Array.from(this.templates.keys())
  }

  /**
   * Get template by name
   */
  getTemplate(name: string): Template | undefined {
    return this.templates.get(name)
  }

  /**
   * Create or update template
   */
  async createTemplate(templateData: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>): Promise<Template> {
    try {
      const template: Template = {
        id: Date.now().toString(),
        name: templateData.name,
        subject: templateData.subject,
        htmlContent: templateData.htmlContent || '',
        textContent: templateData.textContent || '',
        variables: templateData.variables || {},
        isActive: true,
        version: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // In a real implementation, this would save to database
      this.templates.set(templateData.name, template)
      
      logger.info('Template created', { name: templateData.name })
      return template
    } catch (error) {
      logger.error('Failed to create template', error, { name: templateData.name })
      throw error
    }
  }

  /**
   * Update template
   */
  async updateTemplate(id: string, updates: Partial<Template>): Promise<Template> {
    try {
      const template = this.templates.get(id)
      if (!template) {
        throw new Error(`Template with id '${id}' not found`)
      }

      const updatedTemplate = {
        ...template,
        ...updates,
        updatedAt: new Date()
      }

      this.templates.set(id, updatedTemplate)
      
      logger.info('Template updated', { id, updates })
      return updatedTemplate
    } catch (error) {
      logger.error('Failed to update template', error, { id })
      throw error
    }
  }

  /**
   * Delete template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    try {
      const template = this.templates.get(id)
      if (!template) {
        return false
      }

      this.templates.delete(id)
      
      logger.info('Template deleted', { id })
      return true
    } catch (error) {
      logger.error('Failed to delete template', error, { id })
      return false
    }
  }

  /**
   * Deactivate template
   */
  async deactivateTemplate(id: string): Promise<boolean> {
    try {
      const template = this.templates.get(id)
      if (!template) {
        return false
      }

      const updatedTemplate = {
        ...template,
        isActive: false,
        updatedAt: new Date()
      }

      this.templates.set(id, updatedTemplate)
      
      logger.info('Template deactivated', { id })
      return true
    } catch (error) {
      logger.error('Failed to deactivate template', error, { id })
      return false
    }
  }
}

export const templateEngine = new TemplateEngine()