-- CreateMigration
-- Add comprehensive email system models for Mailgun integration

-- EmailJob model for queue management
CREATE TABLE "email_jobs" (
    "id" SERIAL PRIMARY KEY,
    "message_id" TEXT UNIQUE,
    "template_type" TEXT NOT NULL,
    "recipient_email" TEXT NOT NULL,
    "recipient_name" TEXT,
    "subject" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'QUEUED',
    "priority" TEXT NOT NULL DEFAULT 'NORMAL',
    "scheduled_at" TIMESTAMP,
    "sent_at" TIMESTAMP,
    "delivered_at" TIMESTAMP,
    "opened_at" TIMESTAMP,
    "clicked_at" TIMESTAMP,
    "bounced_at" TIMESTAMP,
    "complained_at" TIMESTAMP,
    "bounce_reason" TEXT,
    "complaint_type" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "last_error" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EmailDeliveryEvent model for webhook tracking
CREATE TABLE "email_delivery_events" (
    "id" SERIAL PRIMARY KEY,
    "email_job_id" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "timestamp" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "data" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    CONSTRAINT "fk_email_job" FOREIGN KEY ("email_job_id") REFERENCES "email_jobs"("id") ON DELETE CASCADE
);

-- EmailTemplate model for dynamic content
CREATE TABLE "email_templates" (
    "id" SERIAL PRIMARY KEY,
    "name" TEXT UNIQUE NOT NULL,
    "subject" TEXT NOT NULL,
    "html_content" TEXT NOT NULL,
    "text_content" TEXT,
    "variables" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EmailSuppression model for compliance
CREATE TABLE "email_suppressions" (
    "id" SERIAL PRIMARY KEY,
    "email" TEXT UNIQUE NOT NULL,
    "type" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP
);

-- Add indexes for performance
CREATE INDEX "idx_email_jobs_status_priority" ON "email_jobs"("status", "priority");
CREATE INDEX "idx_email_jobs_created_at" ON "email_jobs"("created_at");
CREATE INDEX "idx_email_jobs_recipient" ON "email_jobs"("recipient_email");
CREATE INDEX "idx_email_delivery_events_job_id" ON "email_delivery_events"("email_job_id");
CREATE INDEX "idx_email_delivery_events_timestamp" ON "email_delivery_events"("timestamp");

-- Add constraint for valid email statuses
ALTER TABLE "email_jobs" ADD CONSTRAINT "chk_email_status" 
    CHECK ("status" IN ('QUEUED', 'SENDING', 'SENT', 'DELIVERED', 'OPENED', 'CLICKED', 'BOUNCED', 'COMPLAINED', 'FAILED', 'CANCELLED'));

-- Add constraint for valid priorities
ALTER TABLE "email_jobs" ADD CONSTRAINT "chk_priority" 
    CHECK ("priority" IN ('LOW', 'NORMAL', 'HIGH', 'CRITICAL'));

-- Add constraint for valid suppression types
ALTER TABLE "email_suppressions" ADD CONSTRAINT "chk_suppression_type" 
    CHECK ("type" IN ('BOUNCE', 'COMPLAINT', 'UNSUBSCRIBE', 'MANUAL'));