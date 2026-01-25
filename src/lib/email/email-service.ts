/**
 * @file email-service.ts
 * @description Enhanced email service with queue management and delivery tracking
 */

import { logger } from '../logger'
import { QueueManager, EmailStatus, Priority, type EmailJob } from './queue-manager'

export interface EmailSendOptions {
  to: string | string[]
  subject: string
  html?: string
  text?: string
  from?: string
  replyTo?: string
  priority?: Priority
  scheduledAt?: Date
  maxRetries?: number
}

export interface DeliveryTrackingOptions {
  trackDelivery?: boolean
  trackOpens?: boolean
  trackClicks?: boolean
  metadata?: Record<string, any>
}

export type { EmailJob }

export interface QueueStats {
  total: number
  queued: number
  processing: number
  sent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
  averageProcessingTime: number
}

export class EnhancedEmailService {
  private queueManager: QueueManager

  constructor() {
    this.queueManager = new QueueManager()
  }

  /**
   * Send email immediately (queued and processed asynchronously)
   */
  async sendEmail(options: EmailSendOptions, trackingOptions?: DeliveryTrackingOptions): Promise<EmailJob> {
    try {
      logger.info('Enqueuing email for sending', {
        to: options.to,
        subject: options.subject,
        priority: options.priority || 'NORMAL'
      })

      const job: Omit<EmailJob, 'id' | 'createdAt' | 'updatedAt'> = {
        templateType: 'custom',
        recipientEmail: Array.isArray(options.to) ? options.to[0] : options.to,
        recipientName: this.extractNameFromEmail(Array.isArray(options.to) ? options.to[0] : options.to),
        subject: options.subject,
        content: {
          templateType: 'custom',
          html: options.html,
          text: options.text,
          metadata: trackingOptions?.metadata || {}
        },
        status: EmailStatus.QUEUED,
        priority: (options.priority as Priority) || Priority.NORMAL,
        scheduledAt: options.scheduledAt,
        maxRetries: options.maxRetries || 3,
        retryCount: 0
      }

      return await this.queueManager.enqueue(job)
    } catch (error) {
      logger.error('Failed to enqueue email', error, {
        to: options.to,
        subject: options.subject
      })
      throw error
    }
  }

  /**
   * Send template-based email
   */
  async sendTemplate(templateName: string, data: any, options?: Omit<EmailSendOptions, 'html' | 'text'>, trackingOptions?: DeliveryTrackingOptions): Promise<EmailJob> {
    try {
      const opts = options || { to: '', subject: '' }
      logger.info('Sending template email', {
        template: templateName,
        recipientEmail: opts.to as string,
        dataKeys: Object.keys(data || {})
      })

      const job: Omit<EmailJob, 'id' | 'createdAt' | 'updatedAt'> = {
        templateType: templateName,
        recipientEmail: opts.to as string,
        recipientName: data.name || this.extractNameFromEmail(opts.to as string),
        subject: opts.subject || this.generateSubjectFromTemplate(templateName, data),
        content: {
          templateType: templateName,
          html: undefined, // Will be rendered by template engine
          text: undefined,
          metadata: { ...data, templateName }
        },
        status: EmailStatus.QUEUED,
        priority: (opts.priority as Priority) || Priority.NORMAL,
        scheduledAt: opts.scheduledAt,
        maxRetries: opts.maxRetries || 3,
        retryCount: 0
      }

      return await this.queueManager.enqueue(job)
    } catch (error) {
      logger.error('Failed to enqueue template email', error, {
        template: templateName,
        data: Object.keys(data || {}),
        to: options?.to
      })
      throw error
    }
  }

  /**
   * Schedule email for future sending
   */
  async scheduleEmail(options: EmailSendOptions, sendAt: Date): Promise<EmailJob> {
    try {
      logger.info('Scheduling email', {
        to: options.to,
        subject: options.subject,
        scheduledAt: sendAt
      })

      const job: Omit<EmailJob, 'id' | 'createdAt' | 'updatedAt'> = {
        templateType: 'custom',
        recipientEmail: Array.isArray(options.to) ? options.to[0] : options.to,
        recipientName: this.extractNameFromEmail(Array.isArray(options.to) ? options.to[0] : options.to),
        subject: options.subject,
        content: {
          templateType: 'custom',
          html: options.html,
          text: options.text,
          metadata: { scheduledFor: sendAt.toISOString() }
        },
        status: EmailStatus.QUEUED,
        priority: (options.priority as Priority) || Priority.NORMAL,
        scheduledAt: sendAt,
        maxRetries: options.maxRetries || 3,
        retryCount: 0
      }

      return await this.queueManager.enqueue(job)
    } catch (error) {
      logger.error('Failed to schedule email', error, {
        to: options.to,
        subject: options.subject,
        scheduledAt: sendAt
      })
      throw error
    }
  }

  /**
   * Cancel pending email
   */
  async cancelEmail(jobId: string): Promise<boolean> {
    try {
      logger.info('Cancelling email job', { jobId })
      return await this.queueManager.cancelEmail(jobId)
    } catch (error) {
      logger.error('Failed to cancel email job', error, { jobId })
      return false
    }
  }

  /**
   * Retry failed email
   */
  async retryEmail(jobId: string): Promise<boolean> {
    try {
      logger.info('Retrying email job', { jobId })
      return await this.queueManager.retryEmail(jobId)
    } catch (error) {
      logger.error('Failed to retry email job', error, { jobId })
      return false
    }
  }

  /**
   * Get delivery status for email
   */
  async getDeliveryStatus(messageId: string): Promise<'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'COMPLAINED' | 'FAILED' | 'CANCELLED'> {
    try {
      logger.debug('Getting delivery status', { messageId })
      // This would query database for email job status
      // For now, return a default status
      return 'SENT'
    } catch (error) {
      logger.error('Failed to get delivery status', error, { messageId })
      throw error
    }
  }

  /**
   * Get email analytics
   */
  async getAnalytics(filter?: {
    startDate?: Date
    endDate?: Date
    status?: 'QUEUED' | 'SENDING' | 'SENT' | 'DELIVERED' | 'OPENED' | 'CLICKED' | 'BOUNCED' | 'COMPLAINED' | 'FAILED' | 'CANCELLED'
  }): Promise<{
    total: number
    sent: number
    delivered: number
    failed: number
  }> {
    try {
      const stats = await this.queueManager.getQueueStats()
      
      logger.info('Email analytics retrieved', stats)
      return {
        total: stats.total,
        sent: stats.sent,
        delivered: stats.delivered,
        failed: stats.failed
      }
    } catch (error) {
      logger.error('Failed to get email analytics', error)
      throw error
    }
  }

  /**
   * Start queue processing
   */
  async startQueueProcessing(): Promise<void> {
    try {
      logger.info('Starting email queue processing')
      await this.queueManager.processQueue()
    } catch (error) {
      logger.error('Queue processing error', error)
      throw error
    }
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<{
    total: number
    queued: number
    sending: number
    sent: number
    delivered: number
    failed: number
  }> {
    try {
      const stats = await this.queueManager.getQueueStats()
      
      logger.info('Queue stats retrieved', stats)
      return {
        total: stats.total,
        queued: stats.queued,
        sending: stats.sending,
        sent: stats.sent,
        delivered: stats.delivered,
        failed: stats.failed
      }
    } catch (error) {
      logger.error('Failed to get queue stats', error)
      throw error
    }
  }

  /**
   * Extract name from email address
   */
  private extractNameFromEmail(email: string): string {
    const namePart = email.split('@')[0]
    return namePart.split('.')[0].replace(/[^a-zA-Z\s]/g, ' ').replace(/\b\w/g, (match) => match.charAt(0).toUpperCase() + match.slice(1))
  }

  /**
   * Generate subject from template
   */
  private generateSubjectFromTemplate(templateName: string, data: any): string {
    const templateSubjects: Record<string, string> = {
      'password-reset': 'Password Reset - The Tech Deputies',
      'admin-notification': 'Admin Action Notification - The Tech Deputies',
      'welcome': 'Welcome to The Tech Deputies',
      'course-purchase': 'Course Purchase Confirmation - The Tech Deputies',
      'gift-card': 'Gift Card Confirmation - The Tech Deputies'
    }

    return templateSubjects[templateName] || 'Email from The Tech Deputies'
  }

  /**
   * Check if email service is enhanced
   */
  isEnhanced(): boolean {
    return this.queueManager !== undefined
  }

  /**
   * Get queue manager instance
   */
  getQueueManager(): QueueManager {
    return this.queueManager
  }
}

export const enhancedEmailService = new EnhancedEmailService()

// Convenience exports used by API endpoints
export async function getAllEmailJobs() {
  return enhancedEmailService.getQueueManager().getAllJobs()
}

export async function getQueueMetrics() {
  return enhancedEmailService.getQueueStats()
}