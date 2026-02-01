# Database Schema Documentation

This document provides a comprehensive reference for The Tech Deputies database schema. For the complete source, see [schema.prisma](../Websites/thetechdeputies.com/prisma/schema.prisma).

## Overview

The Tech Deputies uses PostgreSQL with Prisma ORM. The schema is organized into logical domains:

- **Authentication**: Users, sessions, tokens
- **Billing & Subscriptions**: Plans, subscriptions, gift cards
- **Courses**: Course purchases
- **Booking & Calendar**: Events, bookings
- **Communication**: Email jobs and templates
- **Support**: Tickets and comments
- **Auditing**: Password changes, admin actions
- **Configuration**: Settings, rate limits

---

## Core Models

### 👤 User
Primary user account model.

```prisma
model User {
  id              Int       @id @default(autoincrement())
  email           String    @unique
  passwordHash    String
  name            String?
  role            Role      @default(USER)  // USER or ADMIN
  emailVerified   Boolean   @default(false)
  acuityClientId  String?   // Legacy Acuity integration
  stripeCustomerId String?  // Stripe customer reference
  deletedAt       DateTime? // Soft delete support
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  // Relations
  sessions                  Session[]
  passwordResetTokens       PasswordResetToken[]
  emailVerificationTokens   EmailVerificationToken[]
  coursePurchases           CoursePurchase[]
  passwordChangeAudits      PasswordChangeAudit[]
  adminActions              AdminActionAudit[]
  calendarEvents            CalendarEvent[]
  bookings                  Booking[]
  tickets                   Ticket[]
  ticketComments            TicketComment[]
  subscriptions             UserSubscription[]
}

enum Role {
  USER
  ADMIN
}
```

**Indexes**: `email` (unique)  
**Soft Deletes**: Yes (`deletedAt`)  
**Key Fields**: `role` for permissions, `stripeCustomerId` for billing

---

### 🔐 Authentication Models

#### Session
NextAuth.js v5 session storage with Upstash Redis adapter.

```prisma
model Session {
  id        String   @id
  userId    Int
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### PasswordResetToken
One-time password reset tokens.

```prisma
model PasswordResetToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @unique
  expiresAt DateTime
  used      Boolean  @default(false)
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

#### EmailVerificationToken
Email verification tokens for account activation.

```prisma
model EmailVerificationToken {
  id        Int      @id @default(autoincrement())
  userId    Int
  token     String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

---

### 💳 Billing & Subscriptions

#### Plan
Subscription plan definitions.

```prisma
model Plan {
  id              Int       @id @default(autoincrement())
  name            String    @unique         // Internal identifier
  displayName     String                    // Public name
  description     String?
  priceInCents    Int                       // In USD cents
  tier            PlanTier                  // BASIC, STANDARD, PREMIUM
  sessionLimit    Int                       // Sessions per month
  courseInclusion CourseInclusion           // NONE, PARTIAL, FULL
  familySize      Int       @default(1)    // Max users on plan
  supportTier     SupportTier               // EMAIL, PRIORITY, PREMIUM_24_7
  featured        Boolean   @default(false) // Show as featured
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  userSubscriptions UserSubscription[]
}

enum PlanTier {
  BASIC
  STANDARD
  PREMIUM
}

enum CourseInclusion {
  NONE      // No courses included
  PARTIAL   // Limited courses
  FULL      // All courses
}

enum SupportTier {
  EMAIL      // Email support only
  PRIORITY   // Priority email + phone
  PREMIUM    // 24/7 premium support
}
```

**Current Plans** (seeded in development):
- Basic: 2 sessions/mo, $49/mo
- Standard: 5 sessions/mo, $99/mo  
- Premium: Unlimited sessions, $199/mo

#### UserSubscription
Active subscription records for users. Created via Stripe webhook when payment succeeds.

```prisma
model UserSubscription {
  id                    Int       @id @default(autoincrement())
  userId                Int
  planId                Int
  stripeSubscriptionId  String?   @unique  // Stripe subscription ID
  status                SubscriptionStatus @default(ACTIVE)
  currentPeriodStart    DateTime           // Billing period start
  currentPeriodEnd      DateTime           // Billing period end
  cancelledAt           DateTime? // When cancelled
  sessionBookedThisMonth Int      @default(0)
  createdAt             DateTime  @default(now())
  updatedAt             DateTime  @updatedAt

  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  plan                  Plan      @relation(fields: [planId], references: [id], onDelete: Restrict)

  @@unique([userId, status])      // Only one ACTIVE per user
  @@index([status])
  @@index([currentPeriodEnd])      // For finding expiring subscriptions
}

enum SubscriptionStatus {
  ACTIVE     // Currently active
  CANCELLED  // Cancelled by user or Stripe
  EXPIRED    // Billing period ended
  PAST_DUE   // Payment failed, retry pending
}
```

**Lifecycle**:
1. User purchases on /subscriptions page
2. Stripe checkout completes payment
3. Stripe webhook sends `customer.subscription.created`
4. Backend creates `UserSubscription` record with `ACTIVE` status
5. Dashboard displays via `/api/subscriptions` endpoint
6. On cancellation, Stripe webhook sets status to `CANCELLED`

#### GiftCard
Gift card management for tech support sessions.

```prisma
model GiftCard {
  id              Int       @id @default(autoincrement())
  code            String    @unique
  originalAmount  Int       @map("original_amount")
  remainingAmount Int       @map("remaining_amount")
  purchaserEmail  String
  purchaserName   String?
  recipientEmail  String?
  recipientName   String?
  message         String?
  status          GiftCardStatus @default(ACTIVE)
  purchasedAt     DateTime  @default(now())
  expiresAt       DateTime?
  createdAt       DateTime  @default(now())

  transactions    GiftCardTransaction[]
}

enum GiftCardStatus {
  ACTIVE
  REDEEMED
  EXPIRED
  CANCELLED
}
```

---

### 📚 Courses

#### CoursePurchase
Track which users have access to which courses.

```prisma
model CoursePurchase {
  id           Int       @id @default(autoincrement())
  userId       Int
  courseSlug   String    // URL-friendly course identifier
  amountPaid   Int       // In cents
  giftCardCode String?   // If purchased with gift card
  status       CoursePurchaseStatus @default(ACTIVE)
  purchasedAt  DateTime  @default(now())
  expiresAt    DateTime? // Optional expiration

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, courseSlug])  // Can't purchase same course twice
}

enum CoursePurchaseStatus {
  ACTIVE
  REFUNDED
  EXPIRED
}
```

**Courses** (hardcoded):
- `computer-basics-101`
- `smartphone-mastery`
- `email-essentials`
- `social-media-safety`
- `password-security`
- `smart-home-basics`

---

### 📅 Calendar & Booking

#### CalendarEvent
Available time slots for tech support sessions.

```prisma
model CalendarEvent {
  id           String    @id @default(cuid())
  title        String
  description  String?
  startTime    DateTime
  endTime      DateTime
  capacity     Int       @default(2)      // Max bookings
  bookedCount  Int       @default(0)      // Current bookings
  adminId      Int
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  admin        User      @relation(fields: [adminId], references: [id], onDelete: Restrict)
  bookings     Booking[]

  @@index([startTime])
}
```

#### Booking
User bookings for calendar events.

```prisma
model Booking {
  id           String        @id @default(cuid())
  userId       Int
  eventId      String
  bookedAt     DateTime      @default(now())
  cancelledAt  DateTime?
  status       BookingStatus @default(CONFIRMED)
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt

  user         User          @relation(fields: [userId], references: [id], onDelete: Restrict)
  event        CalendarEvent @relation(fields: [eventId], references: [id], onDelete: Cascade)

  @@unique([eventId, userId])  // Can't book same event twice
  @@index([eventId])
  @@index([userId])
  @@index([status])
}

enum BookingStatus {
  CONFIRMED
  CANCELLED
}
```

---

### 📧 Email System

#### EmailJob
Email sending queue and delivery tracking.

```prisma
model EmailJob {
  id              Int       @id @default(autoincrement())
  messageId       String?   @unique // From Mailgun
  templateType    String    // subscription_confirmation, password_reset, etc.
  recipientEmail  String
  recipientName   String?
  subject         String
  content         Json      // Template variables
  status          EmailStatus @default(QUEUED)
  priority        Priority @default(NORMAL)
  scheduledAt     DateTime?
  sentAt          DateTime?
  deliveredAt     DateTime?
  openedAt        DateTime?
  clickedAt       DateTime?
  bouncedAt       DateTime?
  complainedAt    DateTime?
  bounceReason    String?
  complaintType   String?
  retryCount      Int       @default(0)
  maxRetries      Int       @default(3)
  lastError       String?
  createdAt       DateTime  @default(now())
  updatedAt       DateTime  @updatedAt

  deliveryEvents EmailDeliveryEvent[]
}

enum EmailStatus {
  QUEUED       // Waiting to send
  SENDING      // In progress
  SENT         // Sent by Mailgun
  DELIVERED    // Delivered to recipient
  OPENED       // Recipient opened
  CLICKED      // Recipient clicked link
  BOUNCED      // Bounce event
  COMPLAINED   // Complaint (spam report)
  FAILED       // Failed to send
  CANCELLED    // Cancelled
}

enum Priority {
  LOW
  NORMAL
  HIGH
  CRITICAL
}
```

#### EmailTemplate
Reusable email templates.

```prisma
model EmailTemplate {
  id          Int       @id @default(autoincrement())
  name        String    @unique  // subscription_confirmation, etc.
  subject     String
  htmlContent String
  textContent String?
  variables   Json?     // List of template variables
  isActive    Boolean   @default(true)
  version     Int       @default(1)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

#### EmailSuppression
Suppressed email addresses (bounces, complaints, unsubscribes).

```prisma
model EmailSuppression {
  id        Int              @id @default(autoincrement())
  email     String           @unique
  type      SuppressionType  // BOUNCE, COMPLAINT, UNSUBSCRIBE, MANUAL
  reason    String?
  createdAt DateTime         @default(now())
  expiresAt DateTime?        // Permanent if null
}

enum SuppressionType {
  BOUNCE
  COMPLAINT
  UNSUBSCRIBE
  MANUAL
}
```

---

### 🎫 Support System

#### Ticket
Support tickets/issue tracking.

```prisma
model Ticket {
  id           String         @id @default(cuid())
  userId       Int
  projectId    String?        // Optional project reference
  title        String
  description  String?
  status       TicketStatus   @default(TODO)
  priority     TicketPriority @default(MEDIUM)
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt

  user         User           @relation(fields: [userId], references: [id], onDelete: Restrict)
  comments     TicketComment[]
}

enum TicketStatus {
  TODO
  IN_PROGRESS
  BLOCKED
  DONE
}

enum TicketPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}
```

#### TicketComment
Comments on support tickets.

```prisma
model TicketComment {
  id        String   @id @default(cuid())
  ticketId  String
  userId    Int
  content   String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  ticket    Ticket   @relation(fields: [ticketId], references: [id], onDelete: Cascade)
  user      User     @relation(fields: [userId], references: [id], onDelete: Restrict)
}
```

---

### 🔐 Auditing & Logging

#### PasswordChangeAudit
Track password changes for security compliance.

```prisma
model PasswordChangeAudit {
  id           Int      @id @default(autoincrement())
  userId       Int      // User whose password changed
  changedBy    Int      // Admin or user
  changeType   ChangeType // SELF_CHANGE, ADMIN_FORCE_CHANGE, ADMIN_RESET
  ipAddress    String?
  userAgent    String?
  success      Boolean  @default(true)
  errorMessage String?
  createdAt    DateTime @default(now())

  user         User @relation(fields: [userId], references: [id], onDelete: Cascade)
  changedByUser User @relation("PasswordChanger", fields: [changedBy], references: [id])
}

enum ChangeType {
  SELF_CHANGE
  ADMIN_FORCE_CHANGE
  ADMIN_RESET
}
```

#### AdminActionAudit
Track admin actions for compliance.

```prisma
model AdminActionAudit {
  id           Int      @id @default(autoincrement())
  adminId      Int
  action       String   // "user_created", "subscription_modified", etc.
  targetUserId Int?     // User affected by action
  targetEmail  String?
  details      Json?    // Additional details
  ipAddress    String?
  userAgent    String?
  success      Boolean  @default(true)
  errorMessage String?
  createdAt    DateTime @default(now())

  admin User @relation(fields: [adminId], references: [id], onDelete: Cascade)
}
```

---

### ⚙️ Configuration

#### Setting
Global application settings.

```prisma
model Setting {
  key       String   @id      // e.g., "subscription_warning_threshold"
  value     String?
  encrypted Boolean  @default(false)
  updatedAt DateTime @updatedAt
}
```

#### RateLimit
API rate limiting per IP and endpoint.

```prisma
model RateLimit {
  id        Int      @id @default(autoincrement())
  ipAddress String
  endpoint  String   // e.g., "/api/auth/login"
  attempts  Int      @default(1)
  windowStart DateTime @default(now())

  @@unique([ipAddress, endpoint])
}
```

---

## Database Migrations

Migrations are stored in `Websites/thetechdeputies.com/prisma/migrations/`:

- `20260120044117_init/` - Initial schema
- `20260201_add_stripe_plans_subscriptions/` - Stripe subscription system
- `20260201063445_add_user_management_and_calendaring/` - User management and booking
- `20260201110001_add_stripe_plans_subscriptions/` - Additional Stripe configuration

### Running Migrations

```bash
# Apply pending migrations (development)
bun prisma migrate dev

# Apply migrations (production)
bun prisma migrate deploy

# Create new migration after schema change
bun prisma migrate dev --name add_feature_name

# Reset database (DESTRUCTIVE - dev only)
bun prisma migrate reset
```

---

## Connection & Studio

### Connect via psql

```bash
# Prisma automatically loads DATABASE_URL from .env.local
psql "$DATABASE_URL"

# Or use Prisma Studio
bun prisma studio --url "$DATABASE_URL"
```

### Environment Variables

```bash
# Remote PostgreSQL (production)
DATABASE_URL_REMOTE=postgres://user:password@host:port/db?sslmode=verify-full

# Local PostgreSQL (for development - optional)
DATABASE_URL_LOCAL=postgres://dev:pass@localhost:5432/thetechdeputies

# Toggle between local/remote
DB_HOST_LOCAL=false  # Set true to use local, false for remote
```

---

## Key Design Patterns

### 1. Soft Deletes
Users support soft delete via `deletedAt` field to preserve audit trails.

```sql
-- Query active users only
SELECT * FROM users WHERE deleted_at IS NULL;

-- Find deleted users
SELECT * FROM users WHERE deleted_at IS NOT NULL;
```

### 2. One Active Subscription Per User
Unique constraint ensures only one ACTIVE subscription per user:

```prisma
@@unique([userId, status])
```

### 3. Cascading Deletes
- User deletion cascades to sessions, purchases, tickets, etc.
- Prevents orphaned records
- CalendarEvent has `Restrict` to prevent accidental admin deletion

### 4. Audit Trail
- `PasswordChangeAudit` tracks all password modifications
- `AdminActionAudit` tracks admin actions
- Both record IP and user agent for security

### 5. Rate Limiting
Per-IP and per-endpoint rate limiting to prevent abuse.

---

## Common Queries

### Get User Subscriptions
```sql
SELECT us.*, p.display_name, p.price_in_cents
FROM user_subscriptions us
JOIN plans p ON us.plan_id = p.id
WHERE us.user_id = $1
AND us.status = 'active'
ORDER BY us.created_at DESC;
```

### Find Active Events in Next 7 Days
```sql
SELECT * FROM calendar_events
WHERE start_time BETWEEN NOW() AND NOW() + INTERVAL '7 days'
AND booked_count < capacity
ORDER BY start_time;
```

### Get Email Delivery Report
```sql
SELECT status, COUNT(*) as count, AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_time_seconds
FROM email_jobs
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY status;
```

### Find Expiring Subscriptions
```sql
SELECT us.*, u.email
FROM user_subscriptions us
JOIN users u ON us.user_id = u.id
WHERE us.status = 'active'
AND us.current_period_end < NOW() + INTERVAL '3 days';
```

---

## Performance Considerations

### Indexes
- `calendar_events.start_time` - For querying available slots
- `user_subscriptions.status` - For finding active subscriptions
- `user_subscriptions.current_period_end` - For expiry queries
- `bookings.eventId`, `bookings.userId`, `bookings.status` - For queries
- `email_jobs` - Implicit indexes on created_at via default sorting

### Query Optimization
- Always include `deletedAt IS NULL` when querying users
- Use `select` to fetch only needed fields
- Paginate large result sets
- Use database-level filtering before Prisma

---

## Related Documentation

- [Stripe Integration](./stripe.md) - Payment processing
- [Email System](./email.md) - Email sending and templates
- [API Routes](../Websites/thetechdeputies.com/src/app/api/README.md) - REST endpoints
- [Authentication](./auth.md) - NextAuth.js setup

---

**Last Updated**: February 1, 2026  
**Schema Version**: 4  
**Provider**: PostgreSQL with Prisma ORM
