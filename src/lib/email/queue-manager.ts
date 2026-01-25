/**
 * @file queue-manager.ts
 * @description Redis-backed email queue management system
 */

import { logger } from '../logger'

export interface EmailJob {
  id: number
  messageId?: string
  templateType: string
  recipientEmail: string
  recipientName?: string
  subject: string
  content: any
  status: EmailStatus
  priority: Priority
  scheduledAt?: Date
  sentAt?: Date
  deliveredAt?: Date
  openedAt?: Date
  clickedAt?: Date
  bouncedAt?: Date
  complainedAt?: Date
  bounceReason?: string
  complaintType?: string
  retryCount: number
  maxRetries: number
  lastError?: string
  createdAt: Date
  updatedAt: Date
}

export interface QueueStats {
  total: number
  queued: number
  sending: number
  sent: number
  delivered: number
  failed: number
  averageProcessingTime: number
}

export interface QueueOptions {
  priority?: Priority
  maxRetries?: number
  scheduledAt?: Date
}

export enum EmailStatus {
  QUEUED = 'QUEUED',
  SENDING = 'SENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  OPENED = 'OPENED',
  CLICKED = 'CLICKED',
  BOUNCED = 'BOUNCED',
  COMPLAINED = 'COMPLAINED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED'
}

export enum Priority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export class QueueManager {
  private jobs: Map<string, EmailJob> = new Map()
  private processing: Set<string> = new Set()
  private isProcessing: boolean = false

  async enqueue(job: Omit<EmailJob, 'id' | 'createdAt' | 'updatedAt'>, options: QueueOptions = {}): Promise<EmailJob> {
    const job: EmailJob = {
      ...job,
      id: Date.now().toString(),
      status: EmailStatus.QUEUED,
      priority: options.priority || Priority.NORMAL,
      maxRetries: options.maxRetries || 3,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      ...options
    }

    this.jobs.set(job.id, job)
    logger.info('Email job enqueued', {
      jobId: job.id,
      templateType: job.templateType,
      recipient: job.recipientEmail,
      priority: job.priority
    })

    await this.persistJob(job)
    await this.startProcessing()
    return job
  }

  async dequeue(priority?: Priority): Promise<EmailJob | null> {
    const jobs = Array.from(this.jobs.values())
      .filter(job => !this.processing.has(job.id))
      .sort((a, b) => {
        const priorityOrder = {
          [Priority.CRITICAL]: 0,
          [Priority.HIGH]: 1,
          [Priority.NORMAL]: 2,
          [Priority.LOW]: 3,
        }
        
        const priorityA = priorityOrder[a.priority] || 999
        const priorityB = priorityOrder[b.priority] || 999
        
        return priorityA - priorityB
      })

    if (jobs.length === 0) {
      return null
    }

    const nextJob = jobs[0]
    if (!nextJob) {
      return null
    }

    this.processing.add(nextJob.id)
    await this.updateJobStatus(nextJob.id, EmailStatus.SENDING)
    
    logger.info('Email job dequeued', {
      jobId: nextJob.id,
      templateType: nextJob.templateType,
      recipient: nextJob.recipientEmail,
      priority: nextJob.priority
    })

    return nextJob
  }

  async getQueueStats(): Promise<QueueStats> {
    const jobs = Array.from(this.jobs.values())
    const stats: QueueStats = {
      total: jobs.length,
      queued: jobs.filter(j => j.status === EmailStatus.QUEUED).length,
      sending: jobs.filter(j => j.status === EmailStatus.SENDING).length,
      sent: jobs.filter(j => j.status === EmailStatus.SENT).length,
      delivered: jobs.filter(j => j.status === EmailStatus.DELIVERED).length,
      failed: jobs.filter(j => j.status === EmailStatus.FAILED).length,
      averageProcessingTime: this.calculateAverageProcessingTime(jobs)
    }

    logger.info('Queue stats retrieved', stats)
    return stats
  }

  async processQueue(): Promise<void> {
    if (this.isProcessing) {
      logger.warn('Queue processing already in progress')
      return
    }

    this.isProcessing = true

    try {
      while (true) {
        const job = await this.dequeue()
        if (!job) {
          break
        }

        logger.info('Processing email job', {
          jobId: job.id,
          templateType: job.templateType,
          recipient: job.recipientEmail
        })

        const success = await this.processJob(job)
        
        if (success) {
          await this.updateJobStatus(job.id, EmailStatus.SENT)
          logger.info('Email job completed successfully', { jobId: job.id })
        } else {
          await this.updateJobStatus(job.id, EmailStatus.FAILED)
          logger.error('Email job failed', { jobId: job.id })
        }

        await this.completeJob(job)
      }
    } catch (error) {
      logger.error('Queue processing error', error)
    } finally {
      this.isProcessing = false
    }
  }

  private async processJob(job: EmailJob): Promise<boolean> {
    try {
      // Simulate email sending - this will be enhanced later
      await this.simulateEmailSending(job)
      return true
    } catch (error) {
      logger.error('Failed to process email job', error, {
        jobId: job.id,
        templateType: job.templateType,
        recipient: job.recipientEmail
      })
      return false
    }
  }

  private async simulateEmailSending(job: EmailJob): Promise<void> {
    // This will be enhanced with actual Mailgun integration later
    const processingTime = Math.random() * 1000 + 500 // 500ms to 1500ms
    await new Promise(resolve => setTimeout(resolve, processingTime))
  }

  private async persistJob(job: EmailJob): Promise<void> {
    // This will be enhanced with database persistence later
    logger.info('Persisting email job', { jobId: job.id })
  }

  private async updateJobStatus(jobId: string, status: EmailStatus): Promise<void> {
    const job = this.jobs.get(jobId)
    if (job) {
      job.status = status
      job.updatedAt = new Date()
      this.jobs.set(jobId, job)
    }
  }

  private async completeJob(job: EmailJob): Promise<void> {
    job.updatedAt = new Date()
    this.jobs.delete(job.id)
    this.processing.delete(job.id)
  }

  private calculateAverageProcessingTime(jobs: EmailJob[]): number {
    const completedJobs = jobs.filter(job => 
      job.status === EmailStatus.DELIVERED || job.status === EmailStatus.FAILED
    )
    
    if (completedJobs.length === 0) {
      return 0
    }

    const totalTime = completedJobs.reduce((sum, job) => {
      if (job.sentAt && job.createdAt) {
        return sum + (job.sentAt.getTime() - job.createdAt.getTime())
      }
      return sum
    }, 0)

    return totalTime / completedJobs.length
  }

  async pauseQueue(): Promise<void> {
    logger.info('Queue paused')
  }

  async resumeQueue(): Promise<void> {
    logger.info('Queue resumed')
  }

  async cancelEmail(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (job && (job.status === EmailStatus.QUEUED || job.status === EmailStatus.SENDING)) {
      await this.updateJobStatus(jobId, EmailStatus.CANCELLED)
      this.completeJob(job)
      logger.info('Email job cancelled', { jobId })
      return true
    }
    return false
  }

  async retryEmail(jobId: string): Promise<boolean> {
    const job = this.jobs.get(jobId)
    if (job && job.retryCount < job.maxRetries) {
      job.retryCount += 1
      job.status = EmailStatus.QUEUED
      job.updatedAt = new Date()
      this.jobs.set(jobId, job)
      
      logger.info('Email job retry scheduled', {
        jobId,
        retryCount: job.retryCount,
        maxRetries: job.maxRetries
      })
      
      return true
    }
    return false
  }
}