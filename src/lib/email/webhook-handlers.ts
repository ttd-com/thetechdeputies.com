/**
 * @file webhook-handlers.ts
 * @description Mailgun webhook handlers for delivery tracking and event processing
 */

import { logger } from '../../logger'
import { headers } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export interface WebhookEvent {
  signature: {
    timestamp: string
    token: string
    signature: string
  }
  event: {
    [key: string]: any
    id?: string
    recipient?: string
    domain?: string
    ip?: string
    useragent?: string
    campaign?: string
    [key: string]: {
      'user-variables': any
    'mailing-list': any
      'message': {
        headers: {
          message: {
            subject: string
          }
          from: string
          to: string
        }
        }
      }
    }
  }
}

export interface DeliveryUpdatePayload {
  messageId: string
  status: 'delivered' | 'opened' | 'clicked' | 'bounced' | 'complained'
  timestamp: string
  metadata?: {
    ip?: string
    userAgent?: string
    [key: string]: any
  }
}

export class MailgunWebhookHandler {
  private webhookSigningSecret: string
  private webhookValidIPs: string[]

  constructor() {
    this.webhookSigningSecret = process.env.MAILGUN_WEBHOOK_SIGNING_SECRET || ''
    this.webhookValidIPs = (process.env.MAILGUN_WEBHOOK_VALID_IPS || '').split(',').map(ip => ip.trim())
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(body: string, signature: string): boolean {
    try {
      const crypto = require('crypto')
      const [timestamp, token, rawSignature] = signature.split(',').map(s => s.trim())
      
      const [algo, key] = crypto.createHmac('sha256', this.webhookSigningSecret)
      
      // Reconstruct the string to sign
      const payload = timestamp + token + rawSignature
      const expectedSignature = algo.update('base64').digest('hex')
      
      const isValid = crypto.timingSafeEqual(expectedSignature, signature, 'hex')
      
      return isValid
    } catch (error) {
      logger.error('Webhook signature verification failed', error)
      return false
    }
  }

  /**
   * Get client IP from request
   */
  private getClientIP(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for')
    return forwarded ? forwarded.split(',')[0]?.trim() : req.ip || 'unknown'
  }

  /**
   * Validate webhook request
   */
  private validateWebhookRequest(req: NextRequest): { isValid: boolean; error?: string } {
    // Check if Mailgun is configured
    if (!this.webhookSigningSecret) {
      return {
        isValid: false,
        error: 'Mailgun webhook signing not configured'
      }
    }

    // Get client IP
    const clientIP = this.getClientIP(req)
    
    // Validate IP if whitelist is configured
    if (this.webhookValidIPs.length > 0 && !this.webhookValidIPs.includes(clientIP)) {
      return {
        isValid: false,
        error: `IP ${clientIP} not in whitelist`
      }
    }

    // Get signature from headers
    const signature = req.headers.get('x-mailgun-signature')
    if (!signature) {
      return {
        isValid: false,
        error: 'Missing webhook signature'
      }
    }

    // Get timestamp
    const timestamp = req.headers.get('x-mailgun-timestamp')
    if (!timestamp) {
      return {
        isValid: false,
        error: 'Missing webhook timestamp'
      }
    }

    // Get token
    const token = req.headers.get('x-mailgun-token')
    if (!token) {
      return {
        isValid: false,
        error: 'Missing webhook token'
      }
    }

    // Verify signature
    if (!this.verifyWebhookSignature(req.body, signature)) {
      return {
        isValid: false,
        error: 'Invalid webhook signature'
      }
    }

    return { isValid: true }
  }

  /**
   * Extract event data from webhook payload
   */
  private extractEventData(event: any, message: any): WebhookEvent {
    try {
      return {
        id: message.message.headers?.['message-id'] || event.id,
        recipient: message.message.recipient || event.recipient,
        domain: message.message.domain || event.domain,
        ip: message.message.ip || event.ip,
        useragent: message.message.useragent || event.useragent,
        campaign: message.message.campaign?.id || event.campaign,
        id: event.id,
        recipient: message.message.recipient || event.recipient,
        domain: message.message.domain || event.domain,
        ip: message.message.ip || event.ip,
        useragent: message.message.useragent || event.useragent,
        campaign: message.message.campaign?.id || event.campaign,
        event: event.event,
        timestamp: message.message.timestamp || event.timestamp,
        metadata: {
          'user-variables': message.message['user-variables'] || {},
          'mailing-list': message.message['mailing-list'] || {},
          'message': {
            headers: {
              message: {
                subject: message.message.subject || '',
                from: message.message.from || '',
                to: message.message.to || ''
              }
            }
          }
        }
      }
    } catch (error) {
      logger.error('Failed to extract event data', error)
      
      return {
        id: 'unknown',
        recipient: 'unknown',
        domain: 'unknown',
        ip: 'unknown',
        useragent: 'unknown',
        event: 'unknown',
        metadata: { error: error.message }
      }
    }
  }

  /**
   * Handle delivered event
   */
  private async handleDeliveredEvent(event: WebhookEvent, message: any): Promise<void> {
    const messageId = event.id
    const recipient = event.recipient
    const timestamp = event.timestamp
    
    logger.info('Email delivered', {
      messageId,
      recipient,
      timestamp: timestamp
    })

    // Update email job status to delivered
    await this.updateEmailJobStatus(messageId, 'delivered', {
      deliveredAt: timestamp
    })
  }

  /**
   * Handle opened event
   */
  private async handleOpenedEvent(event: WebhookEvent, message: any): Promise<void> {
    const messageId = event.id
    const recipient = event.recipient
    const timestamp = event.timestamp
    
    logger.info('Email opened', {
      messageId,
      recipient,
      timestamp: timestamp
    })

    // Update email job status to opened
    await this.updateEmailJobStatus(messageId, 'opened', {
      openedAt: timestamp
    })
  }

  /**
   * Handle clicked event
   */
  private async handleClickedEvent(event: WebhookEvent, message: any): Promise<void> {
    const messageId = event.id
    const recipient = event.recipient
    const timestamp = event.timestamp
    
    // Extract click tracking data
    const clickData = message['user-variables']?.click || {}
    
    logger.info('Email clicked', {
      messageId,
      recipient,
      timestamp: timestamp,
      clickData
    })

    // Update email job status to clicked
    await this.updateEmailJobStatus(messageId, 'clicked', {
      clickedAt: timestamp,
      metadata: { clickData }
    })
  }

  /**
   * Handle bounced event
   */
  private async handleBouncedEvent(event: WebhookEvent, message: any): Promise<void> {
    const messageId = event.id
    const recipient = event.recipient
    const timestamp = event.timestamp
    const bounceReason = message.reason || 'Unknown'
    
    logger.warn('Email bounced', {
      messageId,
      recipient,
      timestamp,
      bounceReason
    })

    // Update email job status to bounced
    await this.updateEmailJobStatus(messageId, 'bounced', {
      bouncedAt: timestamp,
      bounceReason,
      retryCount: 1
    })

    // Schedule retry for bounced emails
    await this.scheduleRetry(messageId)
  }

  /**
   * Handle complained event
   */
  private async handleComplainedEvent(event: WebhookEvent, message: any): Promise<void> {
    const messageId = event.id
    const recipient = event.recipient
    const timestamp = event.timestamp
    const complaintType = message.complaint?.reason || 'Unknown'
    
    logger.warn('Email complained', {
      messageId,
      recipient,
      timestamp,
      complaintType
    })

    // Update email job status to complained
    await this.updateEmailJobStatus(messageId, 'complained', {
      complainedAt: timestamp,
      complaintType
    })

    // Create suppression entry
    await this.createSuppressionEntry(recipient, 'COMPLAINT', 'Email was marked as spam by recipient')
  }

  /**
   * Handle failed event
   */
  private async handleFailedEvent(event: WebhookEvent, message: any): Promise<void> {
    const messageId = event.id
    const recipient = event.recipient
    const timestamp = event.timestamp
    const deliveryStatus = message.delivery?.status || 'unknown'
    const errorMessage = message?.delivery?.error || 'Unknown'
    
    logger.error('Email delivery failed', {
      messageId,
      recipient,
      timestamp,
      deliveryStatus,
      errorMessage
    })

    // Update email job status to failed
    await this.updateEmailJobStatus(messageId, 'failed', {
      lastError: errorMessage,
      retryCount: 1
    })

    // Determine if retry is needed
    if (deliveryStatus === 'temporary' || deliveryStatus === 'retry') {
      await this.scheduleRetry(messageId)
    }
  }

  /**
   * Update email job status in database
   */
  private async updateEmailJobStatus(messageId: string, status: string, updates: Partial<{
    deliveredAt?: Date
    openedAt?: Date
    clickedAt?: Date
    bouncedAt?: Date
    complainedAt?: Date
    bounceReason?: string
    complaintType?: string
    retryCount?: number
    lastError?: string
  }>): Promise<void> {
    try {
      // In a real implementation, this would update the database
      logger.info('Updating email job status', {
        messageId,
        status,
        updates
      })
    } catch (error) {
      logger.error('Failed to update email job status', error, { messageId, status })
    }
  }

  /**
   * Schedule email retry
   */
  private async scheduleRetry(messageId: string): Promise<void> {
    try {
      // In a real implementation, this would create a retry job with delay
      const retryDelay = Math.min(5 * 60 * 1000, 60 * 60 * 1000) // 5 minutes
      setTimeout(() => {
        // Would enqueue retry job here
      }, retryDelay)
      
      logger.info('Email retry scheduled', {
        messageId,
        retryDelay
      })
    } catch (error) {
      logger.error('Failed to schedule email retry', error, { messageId })
    }
  }

  /**
   * Create suppression entry
   */
  private async createSuppressionEntry(email: string, type: string, reason?: string): Promise<void> {
    try {
      logger.warn('Email suppression created', {
        email,
        type,
        reason
      })
      
      // In a real implementation, this would add to database
    } catch (error) {
      logger.error('Failed to create suppression entry', error, { email, type, reason })
    }
  }

  /**
   * Main webhook handler
   */
  async handleWebhook(req: NextRequest): Promise<NextResponse> {
    try {
      const signature = req.headers.get('x-mailgun-signature')
      const event = req.headers.get('x-mailgun-event')
      const timestamp = req.headers.get('x-mailgun-timestamp')
      const token = req.headers.get('x-mailgun-token')

      const body = await req.json()

      // Validate webhook request
      const validation = this.validateWebhookRequest(req)
      if (!validation.isValid) {
        return NextResponse.json({
          error: validation.error,
          message: 'Invalid webhook request'
        }, { status: 401 })
      }

      // Get webhook event
      const webhookEvent = this.extractEventData(event, body)
      
      // Log webhook event
      logger.info('Webhook received', {
        event: webhookEvent.event,
        messageId: webhookEvent.id,
        recipient: webhookEvent.recipient,
        timestamp: webhookEvent.timestamp
      })

      // Handle different event types
      switch (webhookEvent.event) {
        case 'delivered':
          await this.handleDeliveredEvent(webhookEvent, body)
          break
          
        case 'opened':
          await this.handleOpenedEvent(webhookEvent, body)
          break
          
        case 'clicked':
          await this.handleClickedEvent(webhookEvent, body)
          break
          
        case 'bounced':
          await this.handleBouncedEvent(webhookEvent, body)
          break
          
        case 'complained':
          await this.handleComplainedEvent(webhookEvent, body)
          break
          
        case 'failed':
          await this.handleFailedEvent(webhookEvent, body)
          break
          
        case 'dropped':
          logger.warn('Email dropped', {
            messageId: webhookEvent.id,
            recipient: webhookEvent.recipient
          })
          break
          
        default:
          logger.warn('Unknown webhook event', {
            event: webhookEvent.event,
            messageId: webhookEvent.id
          })
      }

      return NextResponse.json({ 
        success: true,
        message: 'Webhook processed successfully'
      })
    } catch (error) {
      logger.error('Webhook processing error', error)
      
      return NextResponse.json({
        error: 'Webhook processing failed',
        message: error.message
      }, { status: 500 })
    }
  }

  /**
   * Main webhook endpoint handler
   */
  async handleWebhookEndpoint(req: NextRequest): Promise<NextResponse> {
    // Only accept POST requests
    if (req.method !== 'POST') {
      return NextResponse.json({
        error: 'Method not allowed'
      }, { status: 405 })
    }

    return await this.handleWebhook(req)
  }
}

export const mailgunWebhookHandler = new MailgunWebhookHandler()