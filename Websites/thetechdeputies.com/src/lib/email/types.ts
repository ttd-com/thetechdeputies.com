/**
 * @file types.ts
 * @description Type definitions for email system
 */

export interface EmailJob {
  id: string
  messageId?: string
  templateType: string
  recipientEmail: string
  recipientName?: string
  subject: string
  content: {
    templateType: string
    html?: string
    text?: string
    metadata?: Record<string, any>
  }
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

export interface TemplateData {
  [key: string]: any
}

export interface PasswordResetEmailData {
  userEmail: string
  userName?: string | null
  resetToken: string
  adminName?: string | null
  reason?: string
}

export interface AdminNotificationEmailData {
  adminEmail: string
  adminName?: string | null
  action: string
  targetUser: {
    email: string
    name?: string | null
  }
  details?: any
  timestamp: Date
}