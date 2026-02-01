# Product Requirements Document: User Management & In-House Calendaring

**Project**: The Tech Deputies - User Management & Calendar System  
**Version**: 1.0  
**Date**: January 31, 2026  
**Status**: In Development

---

## Executive Summary

This document outlines the requirements for implementing a comprehensive user management system with profile management, password reset via email, user deletion, and an in-house calendaring system. The system uses Stripe for all monetary transactions and subscriptions. The system will support admin-created calendar events with 1-hour slots and configurable capacity (hardcoded default: 2 spots), client bookings, and automated email notifications with calendar invites.

---

## 1. User Management Features

### 1.1 User Profile Management

**Requirement**: Users can view and manage their account information from a dedicated profile page.

- **Display Fields**:
  - Email address
  - Account joined date
  - User role (USER/ADMIN)
  - Last login timestamp
  - Password change history (from `PasswordChangeAudit` table)

- **Edit Capabilities**:
  - Email (optional, if business logic permits)
  - Display name/profile info

- **Access Control**: Users can only view/edit their own profile; admins can view all users

### 1.2 Password Reset Flow

**Requirement**: Users can securely reset forgotten passwords via email link.

- **Initiation**: User clicks "Reset Password" button on profile page or forgot-password page
- **Token Generation**:
  - Creates `PasswordResetToken` in database with 24-hour expiry
  - Token is cryptographically secure (use `crypto.randomBytes` or similar)
- **Email Delivery**:
  - Sends Mailgun email with reset link: `https://domain.com/auth/reset-password?token={token}`
  - Includes company branding and clear instructions
- **Reset Page**:
  - User clicks link, public page validates token
  - Token must not be expired and not previously used
  - User enters new password (minimum 8 characters, validation per existing auth rules)
  - Password is hashed using bcrypt and stored in `User.passwordHash`
  - Token marked as `used: true` in database
- **Success State**: Redirect to login page with success message

### 1.3 User Deletion (Soft Delete)

**Requirement**: Users can request account deletion; admins can delete users. Deletion is soft (records retained for compliance).

- **Initiation**: User clicks "Delete Account" button on profile page
- **Confirmation Modal**:
  - Warning: "This action cannot be undone"
  - Requires email verification or additional confirmation
- **Soft Delete Logic**:
  - Set `User.deletedAt` to current timestamp
  - Clear sensitive fields: `email` → null, `passwordHash` → null
  - Optionally clear: `firstName`, `lastName`, `phone` (configurable)
  - Keep: `id`, `createdAt`, `updatedAt`, `deletedAt`, `role`, `acuityClientId` (for audit), `stripeCustomerId` (for Stripe integration)
- **Audit Trail**: Log to `AdminActionAudit` table with action type `USER_DELETED`
- **Cascading Effects**:
  - User's bookings remain with `deletedAt` user data (cannot be updated)
  - Tickets remain associated with `userId` (for historical context)
- **Filter**: All user listings/queries exclude `deletedAt IS NOT NULL` records

### 1.4 Dashboard User Card

**Requirement**: Main dashboard displays user profile summary with quick access.

- **Location**: [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)
- **Display**:
  - User's email address
  - Account joined date (formatted: "Joined January 31, 2026")
  - Current role badge (USER/ADMIN)
  - "View Profile" button → `/dashboard/profile`
- **Placement**: Prominent card above existing stats (sessions, subscriptions, etc.)

---

## 2. In-House Calendaring System

### 2.1 Calendar Event Model

**Requirement**: Admins create and manage calendar events (1-hour time slots).

**CalendarEvent Fields**:
- `id`: UUID (primary key)
- `title`: String (event name, e.g., "1-on-1 Coaching")
- `description`: String (optional, event details)
- `startTime`: DateTime (ISO 8601 format)
- `endTime`: DateTime (always startTime + 1 hour)
- `capacity`: Integer (default: 2, min: 1)
- `bookedCount`: Integer (number of confirmed bookings)
- `adminId`: UUID (FK to User, creator of event)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Constraints**:
- `endTime` must equal `startTime + 1 hour`
- `capacity >= 1`
- `bookedCount <= capacity`
- Event times must be within 10am–4pm window (enforced in API validation)
- No overlapping events for same resource (if applicable in future)

### 2.2 Booking Model

**Requirement**: Users book available calendar events; bookings can be confirmed or cancelled.

**Booking Fields**:
- `id`: UUID (primary key)
- `userId`: UUID (FK to User, who booked)
- `eventId`: UUID (FK to CalendarEvent, which event)
- `bookedAt`: DateTime (when booking was created)
- `cancelledAt`: DateTime (nullable, when booking was cancelled)
- `status`: Enum (CONFIRMED | CANCELLED)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**Constraints**:
- `bookedAt` is set to `now()` on creation
- `status` defaults to CONFIRMED on creation
- If `cancelledAt IS NOT NULL`, status is CANCELLED
- Unique constraint: `(eventId, userId)` — prevent double booking

### 2.3 Admin Calendar Management

**Requirement**: Admins can view, create, edit, and delete calendar events.

**Page**: [src/app/dashboard/admin/calendar/page.tsx](src/app/dashboard/admin/calendar/page.tsx)

**Features**:
- **View All Events**:
  - List of upcoming + past events
  - Sort by start time (ascending)
  - Display: title, date, time, capacity badge (e.g., "2/2 booked")
- **Create Event**:
  - Form fields: title, description, date, start time, capacity
  - Validate: capacity >= 1, time within 10am–4pm, startTime < endTime (1 hour)
  - Submit creates `CalendarEvent` record
  - Success: Redirect to event detail or event list
- **Edit Event**:
  - Click event → edit form
  - Pre-populate fields
  - Validate same rules as create
  - Update `CalendarEvent` record
- **Delete Event**:
  - Confirmation modal: "This will cancel all associated bookings"
  - Delete `CalendarEvent` record
  - Set all associated `Booking.cancelledAt` and `status = CANCELLED`
  - Send cancellation emails to all users with bookings on this event
- **View Bookings per Event**:
  - Click event → view attendees list
  - Show user name, email, booking time
  - "Cancel booking" button per attendee (soft delete booking)

### 2.4 Public Booking Page

**Requirement**: Clients view available events for next 7 days (10am–4pm) and book.

**Page**: [src/app/booking/page.tsx](src/app/booking/page.tsx)

**Features**:
- **Display Available Events**:
  - List next 7 days of events (today + 6 days forward)
  - Filter: Only events within 10am–4pm window
  - Sort: By start time (ascending)
  - Show per event: date, start time, title, capacity badge ("1/2 spots available", "2/2 Fully booked")
- **Booking Flow**:
  - Click available event → confirmation modal/form
  - Form displays: event title, date/time, user name (pre-filled), optional notes
  - Submit → POST `/api/bookings`
  - On success: Show confirmation message, send email with .ics calendar invite
  - On error (e.g., fully booked): Show error and reload available events
- **Design**: Mobile-first, high contrast CTA buttons (teal), clear availability status

### 2.5 User Bookings Page

**Requirement**: Users can view their bookings and cancel if needed.

**Page**: [src/app/dashboard/bookings/page.tsx](src/app/dashboard/bookings/page.tsx)

**Features**:
- **Upcoming Bookings**:
  - List of confirmed bookings with `startTime > now()`
  - Show: event title, date, time, "Cancel" button
- **Past Bookings**:
  - Collapsed section: booked events where `startTime < now()` (read-only, no cancel)
- **Cancellation**:
  - Click "Cancel" → confirmation modal
  - Submit → DELETE `/api/bookings/[id]`
  - Sets `Booking.cancelledAt = now()`, `status = CANCELLED`
  - Send cancellation email to user + admin

### 2.6 Admin Dashboard Booking Card

**Requirement**: Admin dashboard shows upcoming bookings summary.

**Page**: [src/app/dashboard/admin/page.tsx](src/app/dashboard/admin/page.tsx)

**Features**:
- **"Upcoming Bookings" Card**:
  - Show next 5 confirmed bookings
  - Display: event title, date/time, attendee name
  - Link: "Manage Calendar" → `/dashboard/admin/calendar`
- **At-a-Glance Stats**:
  - Total bookings this week
  - Average capacity utilization

---

## 3. Email Notifications

### 3.1 Booking Confirmation Email

**Trigger**: When `Booking` is successfully created

**Recipients**: User email + admin email(s)

**Template**: `booking_confirmation`

**Content**:
- Subject: "Booking Confirmed - [Event Title] on [Date]"
- Body:
  - Greeting: "Hi [User Name],"
  - Event details: title, date, time, location/instructions
  - Booking ID for reference
  - Cancellation instructions: "To cancel, visit [link] or reply to this email"
  - Calendar invite (.ics file attachment) with:
    - Event title, start time, end time
    - Company name, phone, email
    - Booking ID in description
    - Cancellation URL in description
  - Footer: Company branding, contact info

### 3.2 Booking Cancellation Email

**Trigger**: When `Booking` is cancelled (user or admin)

**Recipients**: User email + admin email(s)

**Template**: `booking_cancellation`

**Content**:
- Subject: "Booking Cancelled - [Event Title] on [Date]"
- Body:
  - Greeting: "Hi [User Name],"
  - Cancellation confirmation: event details
  - Reason: "Your request" or "Administrator request"
  - Rebooking link: "View available times: [link]"
  - Footer: Company branding, contact info

### 3.3 Event Cancellation Email (Cascade)

**Trigger**: When admin deletes `CalendarEvent`

**Recipients**: All users with bookings on that event

**Template**: `event_cancellation`

**Content**:
- Subject: "Event Cancelled - [Event Title] on [Date]"
- Body:
  - Notification: Event has been cancelled
  - Apology and brief explanation (if applicable)
  - Rebooking link: "View available times: [link]"
  - Footer: Company branding, contact info

---

## 4. Ticket Management (Scaffolding Phase)

### 4.1 Ticket Model

**Requirement**: Scaffold ticket system for Phase 2 implementation (CRUD deferred).

**Ticket Fields**:
- `id`: UUID (primary key)
- `userId`: UUID (FK to User, ticket creator)
- `projectId`: UUID (FK to Project, nullable for Phase 1)
- `title`: String (ticket title)
- `description`: String (ticket description)
- `status`: Enum (TODO | IN_PROGRESS | BLOCKED | DONE)
- `priority`: Enum (LOW | MEDIUM | HIGH | URGENT)
- `createdAt`: DateTime
- `updatedAt`: DateTime

**TicketComment Fields** (for future use):
- `id`: UUID (primary key)
- `ticketId`: UUID (FK to Ticket)
- `userId`: UUID (FK to User, comment author)
- `content`: String (comment text)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### 4.2 Ticket Pages (Wireframe)

**Pages**:
- [src/app/dashboard/tickets/page.tsx](src/app/dashboard/tickets/page.tsx) — List tickets (filtered by user or all for admin)
- [src/app/dashboard/tickets/[id]/page.tsx](src/app/dashboard/tickets/[id]/page.tsx) — Ticket detail view

**Features** (UI/Wireframe only):
- TicketList: Display tickets by status (kanban-style or table)
- TicketCard: Compact view with title, status badge, priority
- TicketDetail: Full ticket info, description, status/priority dropdowns (non-functional)

---

## 5. API Endpoints

### 5.1 Calendar Events Endpoints

**GET `/api/calendar/events`**
- **Query Params**:
  - `days`: Number (default: 7, how many days forward)
  - `startHour`: Number (default: 10, hour in 24h format)
  - `endHour`: Number (default: 16, hour in 24h format)
  - `adminOnly`: Boolean (default: false, if true, return all events; if false, return only public available)
- **Response**: Array of `CalendarEvent` objects
- **Auth**: Public (no auth required for availability view)

**POST `/api/calendar/events`** (Admin-only)
- **Body**:
  ```json
  {
    "title": "string",
    "description": "string (optional)",
    "startTime": "ISO 8601 DateTime",
    "capacity": "integer (default: 2)"
  }
  ```
- **Validation**:
  - `capacity >= 1`
  - `startTime` hour between 10 and 15 (to allow 1-hour slot ending by 4pm)
  - `endTime = startTime + 1 hour`
- **Response**: Created `CalendarEvent` object
- **Auth**: Admin-only (check `user.role === ADMIN`)

**PATCH `/api/calendar/events/[id]`** (Admin-only)
- **Body**: Same as POST (all fields optional)
- **Validation**: Same as POST
- **Response**: Updated `CalendarEvent` object
- **Auth**: Admin-only

**DELETE `/api/calendar/events/[id]`** (Admin-only)
- **Behavior**:
  - Get all `Booking` records for this event
  - Set `Booking.cancelledAt = now()`, `status = CANCELLED` for each
  - Delete `CalendarEvent` record
- **Response**: Success message or error
- **Auth**: Admin-only

### 5.2 Bookings Endpoints

**GET `/api/bookings`**
- **Query Params**:
  - `userId`: UUID (optional, filter by user; if not provided, use authenticated user)
  - `eventId`: UUID (optional, filter by event)
  - `status`: CONFIRMED | CANCELLED (optional)
  - `includeHistory`: Boolean (default: false, if true include cancelled bookings)
- **Response**: Array of `Booking` objects with event details
- **Auth**: User (can view own bookings or all if admin)

**POST `/api/bookings`**
- **Body**:
  ```json
  {
    "eventId": "UUID",
    "notes": "string (optional)"
  }
  ```
- **Validation**:
  - Event exists and is in future
  - Event not full: `bookedCount < capacity`
  - User not already booked on this event (unique constraint)
- **Behavior**:
  - Create `Booking` record
  - Increment `CalendarEvent.bookedCount`
  - Send booking confirmation email with .ics calendar invite
- **Response**: Created `Booking` object
- **Auth**: Authenticated user

**DELETE `/api/bookings/[id]`**
- **Behavior**:
  - Get `Booking` record
  - Check auth (user owns booking or admin)
  - Set `Booking.cancelledAt = now()`, `status = CANCELLED`
  - Decrement `CalendarEvent.bookedCount`
  - Send cancellation email
- **Response**: Success message or error
- **Auth**: User (own booking) or Admin

### 5.3 User Management Endpoints

**GET `/api/users/[id]/profile`**
- **Response**: User object (without `passwordHash`)
- **Auth**: User (own profile) or Admin

**DELETE `/api/users/[id]`**
- **Behavior**:
  - Soft delete: set `deletedAt = now()`, clear `email`, `passwordHash`, etc.
  - Log to `AdminActionAudit`
- **Response**: Success message
- **Auth**: User (own account) or Admin

**POST `/api/auth/request-password-reset`**
- **Body**:
  ```json
  {
    "email": "string"
  }
  ```
- **Behavior**:
  - Find user by email
  - Create `PasswordResetToken` with 24-hour expiry
  - Send email with reset link
- **Response**: Success message (don't reveal if email exists)
- **Auth**: Public

**POST `/api/auth/reset-password`**
- **Body**:
  ```json
  {
    "token": "string",
    "newPassword": "string"
  }
  ```
- **Validation**:
  - Token exists, not expired, not previously used
  - New password >= 8 characters
- **Behavior**:
  - Hash new password
  - Update `User.passwordHash`
  - Mark token as used
  - Log to `PasswordChangeAudit`
- **Response**: Success message
- **Auth**: Public

---

## 6. Database Migration

**Migration**: `add_user_management_and_calendaring`

**Changes**:
- Add `deletedAt` to `User` model
- Create `CalendarEvent` model
- Create `Booking` model
- Create `Ticket` model
- Create `TicketComment` model

---

## 7. Non-Functional Requirements

### 7.1 Security
- All password resets via secure token (24-hour expiry)
- Soft deletes for compliance and audit trails
- Admin-only endpoints require role check
- Rate limiting on password reset endpoint (5 attempts/hour per email)

### 7.2 Performance
- Calendar query for next 7 days should execute < 100ms
- Booking creation should validate capacity and create record atomically (use database transaction)
- Email sending is async (use background queue)

### 7.3 Accessibility
- All forms include ARIA labels
- Capacity badges have descriptive text (not just icons)
- Cancellation confirmations are clear and reversible (in UI messaging)
- Keyboard navigation fully supported

### 7.4 Email Delivery
- Use Mailgun API (already integrated)
- .ics attachments for calendar events
- HTML + plain text versions of all templates
- Include company contact info in all emails

---

## 8. Phase 2 Roadmap (Deferred)

- **Ticket CRUD**: Full create, read, update, delete for tickets with filtering/search
- **Ticket Comments**: Comments on tickets, threaded discussions
- **Project Integration**: Link tickets to courses/projects
- **Recurring Calendar Slots**: Weekly templates, bulk slot creation
- **Custom Time Slots**: Support 30-min and 90-min bookings
- **Waitlist**: If event full, add to waitlist
- **Email Reminders**: 24-hour and 1-hour reminders before bookings
- **Admin Audit Log UI**: View all `AdminActionAudit` records

---

## 9. Testing Strategy

**Test Coverage**:
- Unit tests for calendar utilities (date calculations, availability checks)
- Integration tests for API endpoints (booking flow, capacity validation)
- E2E tests for user flows (book event, cancel booking, reset password)

**Test Framework**: Vitest (existing project setup)

---

## 10. Success Criteria

- [ ] Users can view profile with joined date and account info
- [ ] Users can reset password via secure email link
- [ ] Users can soft-delete their account
- [ ] Admins can create, edit, delete calendar events (1-hour slots, 10am–4pm)
- [ ] Clients can view next 7 days of available events
- [ ] Clients can book events (hardcoded 2-spot capacity)
- [ ] Booking prevents overbooking (capacity check before INSERT)
- [ ] Booking confirmation emails sent with .ics calendar invites
- [ ] Users can cancel bookings; admins can cancel any booking
- [ ] Cancelled bookings trigger email notifications
- [ ] Admin dashboard shows upcoming bookings summary
- [ ] Ticket scaffolding complete (models, pages, wireframes)
- [ ] All endpoints have comprehensive test coverage
- [ ] Zero TypeScript compilation errors
- [ ] WCAG 2.1 Level AA compliance for new pages

---

**Document History**:
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-31 | Planning | Initial PRD |
