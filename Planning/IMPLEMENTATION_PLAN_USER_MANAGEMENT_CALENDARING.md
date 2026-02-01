# Implementation Plan: User Management & In-House Calendaring

**Project**: The Tech Deputies - User Management & Calendar System with Stripe Payments  
**Start Date**: January 31, 2026  
**Target Completion**: TBD  
**Status**: Database & Stripe API Endpoints Complete; Frontend in progress

---

## Phase 1: Database Schema & Setup

### 1.1 Prisma Schema Migration

- [ ] Update `User` model: add `deletedAt` field (DateTime, nullable)
- [ ] Create `CalendarEvent` model with fields: title, description, startTime, endTime, capacity, bookedCount, adminId, timestamps
- [ ] Create `Booking` model with fields: userId, eventId, bookedAt, cancelledAt, status, timestamps
- [ ] Create `Ticket` model with fields: userId, projectId (nullable), title, description, status, priority, timestamps
- [ ] Create `TicketComment` model with fields: ticketId, userId, content, timestamps
- [ ] Add relationships: User → CalendarEvent, CalendarEvent → Booking, User → Booking, User → Ticket, Ticket → TicketComment
- [ ] Add unique constraint: `(eventId, userId)` on Booking (prevent double booking)
- [ ] Add indexes: `CalendarEvent(startTime)`, `Booking(eventId)`, `Booking(userId)`, `Booking(status)`
- [ ] Create migration file: `add_user_management_and_calendaring`
- [ ] Run migration locally: `npx prisma migrate dev --name add_user_management_and_calendaring`
- [ ] Verify schema in Prisma Studio

---

## Phase 2: Email Templates & Setup

### 2.1 Add Email Templates

- [ ] Create template: `booking_confirmation` in email service
  - Variables: `userName`, `eventTitle`, `eventDate`, `eventTime`, `bookingId`, `cancellationUrl`
  - Include .ics attachment reference
- [ ] Create template: `booking_cancellation`
  - Variables: `userName`, `eventTitle`, `eventDate`, `eventTime`, `reason`, `rebookingUrl`
- [ ] Create template: `event_cancellation`
  - Variables: `eventTitle`, `eventDate`, `eventTime`, `rebookingUrl`
- [ ] Create template: `password_reset`
  - Variables: `resetUrl`, `expiryHours`
- [ ] Test templates in Mailgun sandbox
- [ ] Verify HTML rendering and plain text fallback

### 2.2 Calendar Invite (.ics) Utility

- [ ] Create [src/lib/ics-generator.ts](src/lib/ics-generator.ts)
- [ ] Function: `generateICalString(booking, event, companyInfo)` → returns .ics file content
- [ ] Include: EVENT, VEVENT, DTSTART, DTEND, SUMMARY, DESCRIPTION, ORGANIZER, URL
- [ ] Add cancellation URL in DESCRIPTION
- [ ] Test .ics file generation and email attachment

---

## Phase 3: Calendar Utilities & API Setup

### 3.1 Calendar Utility Library

- [ ] Create [src/lib/calendar.ts](src/lib/calendar.ts)
- [ ] Function: `getNextSevenDaysEvents(startHour=10, endHour=16)` → returns list of dates/hours
- [ ] Function: `getAvailableSpots(eventId, db)` → queries capacity - bookedCount
- [ ] Function: `isEventFull(eventId, db)` → boolean
- [ ] Function: `validateEventTime(startTime)` → checks 10am-4pm window, 1-hour duration
- [ ] Function: `formatDateTimeForDisplay(date)` → human-readable format
- [ ] Add JSDoc comments and type definitions
- [ ] Unit tests: See Phase 9 (Test Suite)

### 3.2 API Route Structure

- [ ] Create directory: [src/app/api/calendar/](src/app/api/calendar/)
- [ ] Create directory: [src/app/api/bookings/](src/app/api/bookings/)
- [ ] Create auth middleware wrapper for admin-only endpoints
- [ ] Create error handling utilities for consistent API responses

---

## Phase 4: API Endpoints - Calendar Events

### 4.1 GET `/api/calendar/events`

- [ ] Create [src/app/api/calendar/events/route.ts](src/app/api/calendar/events/route.ts)
- [ ] Query params: `days`, `startHour`, `endHour`, `adminOnly`
- [ ] Query events from database filtered by date range
- [ ] Include `bookedCount` and capacity in response
- [ ] Filter by time window (10am–4pm)
- [ ] Sort by startTime
- [ ] Return: `{ success: true, events: [...], count: number }`
- [ ] Unit tests: See Phase 9

### 4.2 POST `/api/calendar/events` (Admin-only)

- [ ] Create [src/app/api/calendar/events/route.ts](src/app/api/calendar/events/route.ts) POST handler
- [ ] Validate: admin role, capacity >= 1, startTime within 10am–4pm
- [ ] Calculate: endTime = startTime + 1 hour
- [ ] Create CalendarEvent record
- [ ] Set `bookedCount = 0`
- [ ] Return: created event object
- [ ] Return: `{ success: true, event: {...} }` or error
- [ ] Unit tests: See Phase 9

### 4.3 PATCH `/api/calendar/events/[id]`

- [ ] Create [src/app/api/calendar/events/[id]/route.ts](src/app/api/calendar/events/%5Bid%5D/route.ts)
- [ ] Validate: admin role
- [ ] Update: title, description, capacity (cannot update time if bookings exist)
- [ ] Return: updated event object
- [ ] Unit tests: See Phase 9

### 4.4 DELETE `/api/calendar/events/[id]`

- [ ] Create DELETE handler in [src/app/api/calendar/events/[id]/route.ts](src/app/api/calendar/events/%5Bid%5D/route.ts)
- [ ] Validate: admin role
- [ ] Transaction:
  - [ ] Query all Bookings for this event
  - [ ] Set `cancelledAt = now()`, `status = CANCELLED` for each
  - [ ] Delete CalendarEvent
- [ ] Send cancellation emails to all affected users
- [ ] Return: `{ success: true, message: "Event deleted, X bookings cancelled" }`
- [ ] Unit tests: See Phase 9

---

## Phase 5: API Endpoints - Bookings

### 5.1 GET `/api/bookings`

- [ ] Create [src/app/api/bookings/route.ts](src/app/api/bookings/route.ts)
- [ ] Query params: `userId`, `eventId`, `status`, `includeHistory`
- [ ] Auth: user can view own bookings, admin can view all
- [ ] Filter: by userId, eventId, status, include/exclude cancelled
- [ ] Join: Booking with CalendarEvent and User data
- [ ] Return: `{ success: true, bookings: [...], count: number }`
- [ ] Unit tests: See Phase 9

### 5.2 POST `/api/bookings`

- [ ] Create POST handler in [src/app/api/bookings/route.ts](src/app/api/bookings/route.ts)
- [ ] Validate: authenticated user, eventId exists, event in future
- [ ] Capacity check (atomic transaction):
  - [ ] Query CalendarEvent with lock (SELECT FOR UPDATE)
  - [ ] Check: `bookedCount < capacity`
  - [ ] If full, return error: `{ success: false, error: "Event fully booked" }`
  - [ ] Create Booking record
  - [ ] Increment `CalendarEvent.bookedCount`
- [ ] Send booking confirmation email with .ics
- [ ] Return: `{ success: true, booking: {...} }`
- [ ] Unit tests: See Phase 9

### 5.3 DELETE `/api/bookings/[id]`

- [ ] Create [src/app/api/bookings/[id]/route.ts](src/app/api/bookings/%5Bid%5D/route.ts)
- [ ] Validate: authenticated user (owns booking or admin)
- [ ] Transaction:
  - [ ] Get Booking record
  - [ ] Set `cancelledAt = now()`, `status = CANCELLED`
  - [ ] Decrement `CalendarEvent.bookedCount`
- [ ] Send cancellation email
- [ ] Return: `{ success: true, message: "Booking cancelled" }`
- [ ] Unit tests: See Phase 9

---

## Phase 6: API Endpoints - User Management

### 6.1 GET `/api/users/[id]/profile`

- [ ] Create [src/app/api/users/[id]/profile/route.ts](src/app/api/users/%5Bid%5D/profile/route.ts)
- [ ] Validate: auth required (own profile or admin)
- [ ] Return: User object excluding `passwordHash`
- [ ] Include: email, createdAt, role, lastLogin
- [ ] Return: `{ success: true, user: {...} }`
- [ ] Unit tests: See Phase 9

### 6.2 DELETE `/api/users/[id]`

- [ ] Create [src/app/api/users/[id]/route.ts](src/app/api/users/%5Bid%5D/route.ts)
- [ ] Validate: auth required (own account or admin)
- [ ] Transaction:
  - [ ] Set `User.deletedAt = now()`
  - [ ] Set `User.email = null`, `User.passwordHash = null`
  - [ ] Keep: id, createdAt, updatedAt, role, acuityClientId
- [ ] Log to AdminActionAudit: action = USER_DELETED, userId, adminId
- [ ] Return: `{ success: true, message: "Account deleted" }`
- [ ] Unit tests: See Phase 9

### 6.3 POST `/api/auth/request-password-reset`

- [ ] Create [src/app/api/auth/request-password-reset/route.ts](src/app/api/auth/request-password-reset/route.ts)
- [ ] Accept: `{ email: string }`
- [ ] Query: find User by email
- [ ] If not found, return generic success (don't leak user existence)
- [ ] Create PasswordResetToken: `{ token, expires: now() + 24h, used: false }`
- [ ] Send email: reset link with token parameter
- [ ] Return: `{ success: true, message: "Check email for reset link" }`
- [ ] Unit tests: See Phase 9

### 6.4 POST `/api/auth/reset-password`

- [ ] Create [src/app/api/auth/reset-password/route.ts](src/app/api/auth/reset-password/route.ts)
- [ ] Accept: `{ token, newPassword }`
- [ ] Validate:
  - [ ] Token exists in PasswordResetToken table
  - [ ] Token not expired (`expires > now()`)
  - [ ] Token not used (`used = false`)
  - [ ] newPassword >= 8 characters, meets password policy
- [ ] Transaction:
  - [ ] Find User from token
  - [ ] Hash newPassword with bcrypt
  - [ ] Update `User.passwordHash`
  - [ ] Set `PasswordResetToken.used = true`
  - [ ] Create PasswordChangeAudit record: type = PASSWORD_RESET_VIA_EMAIL
- [ ] Return: `{ success: true, message: "Password reset successful. Please login." }`
- [ ] Unit tests: See Phase 9

---

## Phase 7: Frontend Pages - User Management

### 7.1 User Profile Page

- [ ] Create [src/app/dashboard/profile/page.tsx](src/app/dashboard/profile/page.tsx)
- [ ] Display:
  - [ ] User email
  - [ ] Joined date (formatted)
  - [ ] Role badge
  - [ ] Last login
  - [ ] Password change history (table with dates, types)
- [ ] Actions:
  - [ ] "Reset Password" button → modal → POST `/api/auth/request-password-reset`
  - [ ] "Delete Account" button → confirmation modal → DELETE `/api/users/[id]`
- [ ] Success/error messages (toast or alert)
- [ ] Loading states during API calls
- [ ] Unit tests: See Phase 9

### 7.2 Dashboard User Card Update

- [ ] Update [src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)
- [ ] Add user profile card at top
- [ ] Display: email, "Joined [date]", role badge
- [ ] "View Profile" link → `/dashboard/profile`
- [ ] Styling: teal theme, high contrast

### 7.3 Public Password Reset Page

- [ ] Create [src/app/(auth)/reset-password/page.tsx](src/app/(auth)/reset-password/page.tsx)
- [ ] Query param: `token`
- [ ] Validate: token provided and valid (call API to check)
- [ ] Form: new password input, confirm password, submit
- [ ] POST `/api/auth/reset-password` on submit
- [ ] Success: redirect to login with message
- [ ] Error: show error message, allow retry
- [ ] Unit tests: See Phase 9

---

## Phase 8: Frontend Pages - Calendaring

### 8.1 Public Booking Page

- [ ] Update/create [src/app/booking/page.tsx](src/app/booking/page.tsx)
- [ ] Remove: Acuity embed component
- [ ] Add:
  - [ ] Fetch next 7 days events: GET `/api/calendar/events?days=7&startHour=10&endHour=16`
  - [ ] Display in list format (date, time, title, capacity badge)
  - [ ] Click event → booking confirmation modal
  - [ ] Modal: event details, user name (pre-filled), optional notes
  - [ ] Submit → POST `/api/bookings`
  - [ ] Success: confirmation message, send confirmation email
  - [ ] Styling: mobile-first, teal CTA buttons
- [ ] Loading states, error handling
- [ ] Unit tests: See Phase 9

### 8.2 Admin Calendar Management Page

- [ ] Create [src/app/dashboard/admin/calendar/page.tsx](src/app/dashboard/admin/calendar/page.tsx)
- [ ] Display:
  - [ ] List all events (upcoming + past)
  - [ ] Sort by startTime
  - [ ] Show: title, date, time, capacity badge
- [ ] Actions:
  - [ ] "Create Event" button → form modal
  - [ ] Form: title, description, date, time, capacity
  - [ ] Submit → POST `/api/calendar/events`
  - [ ] Click event → detail view / edit form
  - [ ] Edit form → PATCH `/api/calendar/events/[id]`
  - [ ] Delete button → confirmation → DELETE `/api/calendar/events/[id]`
  - [ ] View bookings per event → list of attendees, cancel booking buttons
- [ ] Loading states, success/error messages
- [ ] Unit tests: See Phase 9

### 8.3 User Bookings Page

- [ ] Create [src/app/dashboard/bookings/page.tsx](src/app/dashboard/bookings/page.tsx)
- [ ] Display:
  - [ ] Upcoming bookings (confirmed, startTime > now)
  - [ ] Event title, date, time, status
  - [ ] "Cancel" button per booking
  - [ ] Collapsed "Past Bookings" section (read-only)
- [ ] Cancel action:
  - [ ] Confirmation modal
  - [ ] POST DELETE `/api/bookings/[id]`
  - [ ] Success: remove from list, show message
- [ ] Loading states, error handling
- [ ] Unit tests: See Phase 9

### 8.4 Admin Dashboard Update

- [ ] Update [src/app/dashboard/admin/page.tsx](src/app/dashboard/admin/page.tsx)
- [ ] Add "Upcoming Bookings" card
  - [ ] Fetch next 5 confirmed bookings
  - [ ] Display: event title, date/time, attendee name
  - [ ] "Manage Calendar" link → `/dashboard/admin/calendar`
- [ ] Add booking stats: total this week, avg capacity utilization
- [ ] Styling: consistent with existing dashboard

---

## Phase 9: Ticket Management Scaffolding

### 9.1 Ticket Pages (Wireframe/UI only)

- [ ] Create [src/app/dashboard/tickets/page.tsx](src/app/dashboard/tickets/page.tsx)
  - [ ] Wireframe: ticket list by status (kanban-style)
  - [ ] Placeholder: "Coming soon - Phase 2"
  - [ ] Show: status, priority badges (non-functional)
- [ ] Create [src/app/dashboard/tickets/[id]/page.tsx](src/app/dashboard/tickets/%5Bid%5D/page.tsx)
  - [ ] Wireframe: ticket detail view
  - [ ] Fields: title, description, status (read-only), priority (read-only)
  - [ ] Placeholder: "Full CRUD coming in Phase 2"
- [ ] Create components:
  - [ ] [src/components/molecules/TicketList.tsx](src/components/molecules/TicketList.tsx)
  - [ ] [src/components/atoms/TicketCard.tsx](src/components/atoms/TicketCard.tsx)
  - [ ] [src/components/organisms/TicketDetail.tsx](src/components/organisms/TicketDetail.tsx)

### 9.2 Add TODO Section to README

- [ ] Update [README.md](README.md)
- [ ] Add "## Phase 2 Roadmap" section
- [ ] List upcoming features:
  - [ ] Ticket full CRUD (create, read, update, delete)
  - [ ] Ticket filtering and search
  - [ ] Ticket comments and discussions
  - [ ] Project-ticket linking
  - [ ] Recurring calendar slots (weekly templates)
  - [ ] Custom event duration (30min, 90min)
  - [ ] Booking waitlist
  - [ ] Email reminders (24hr, 1hr before event)
  - [ ] Admin audit log UI

---

## Phase 10: Test Suite

### 10.1 Calendar Utilities Tests

- [ ] Create [src/test/lib/calendar.test.ts](src/test/lib/calendar.test.ts)
- [ ] Test: `getNextSevenDaysEvents()`
  - [ ] Returns 7 days of dates
  - [ ] Filters by 10am–4pm window
  - [ ] Returns correct hour increments
- [ ] Test: `getAvailableSpots()`
  - [ ] Returns capacity - bookedCount
- [ ] Test: `isEventFull()`
  - [ ] Returns true if bookedCount >= capacity
  - [ ] Returns false if bookedCount < capacity
- [ ] Test: `validateEventTime()`
  - [ ] Validates time within 10am–4pm
  - [ ] Validates 1-hour duration
- [ ] Run: `npm run test`

### 10.2 Calendar API Tests

- [ ] Create [src/test/api/calendar-events.test.ts](src/test/api/calendar-events.test.ts)
- [ ] Test: GET `/api/calendar/events`
  - [ ] Returns events in date range
  - [ ] Filters by time window
  - [ ] Returns availability data
- [ ] Test: POST `/api/calendar/events` (admin-only)
  - [ ] Creates event with valid data
  - [ ] Rejects non-admin requests
  - [ ] Validates capacity >= 1
  - [ ] Validates time window
- [ ] Test: PATCH `/api/calendar/events/[id]` (admin-only)
  - [ ] Updates event fields
  - [ ] Validates same rules as POST
- [ ] Test: DELETE `/api/calendar/events/[id]` (admin-only)
  - [ ] Cancels all associated bookings
  - [ ] Sends cancellation emails
  - [ ] Deletes event record
- [ ] Run: `npm run test`

### 10.3 Bookings API Tests

- [ ] Create [src/test/api/bookings.test.ts](src/test/api/bookings.test.ts)
- [ ] Test: GET `/api/bookings`
  - [ ] Returns user's bookings (filter by auth)
  - [ ] Returns all bookings if admin
  - [ ] Filters by status, eventId
- [ ] Test: POST `/api/bookings`
  - [ ] Creates booking with valid eventId
  - [ ] Validates capacity before insert
  - [ ] Prevents double booking (unique constraint)
  - [ ] Returns error if fully booked
  - [ ] Sends confirmation email with .ics
- [ ] Test: DELETE `/api/bookings/[id]`
  - [ ] Cancels booking (soft delete)
  - [ ] Decrements event bookedCount
  - [ ] Sends cancellation email
  - [ ] Allows user or admin to cancel
- [ ] Run: `npm run test`

### 10.4 User Management API Tests

- [ ] Create [src/test/api/users.test.ts](src/test/api/users.test.ts)
- [ ] Test: GET `/api/users/[id]/profile`
  - [ ] Returns user profile (excludes passwordHash)
  - [ ] Auth required
  - [ ] User can view own, admin can view all
- [ ] Test: DELETE `/api/users/[id]`
  - [ ] Soft deletes user (sets deletedAt, clears email/password)
  - [ ] Logs to AdminActionAudit
  - [ ] Auth required (own or admin)
- [ ] Test: POST `/api/auth/request-password-reset`
  - [ ] Creates password reset token
  - [ ] Sends reset email with link
  - [ ] Returns success (doesn't leak user existence)
- [ ] Test: POST `/api/auth/reset-password`
  - [ ] Validates token (exists, not expired, not used)
  - [ ] Validates password policy
  - [ ] Updates password hash
  - [ ] Marks token as used
  - [ ] Creates PasswordChangeAudit record
- [ ] Run: `npm run test`

### 10.5 Frontend Component Tests

- [ ] Create [src/test/components/UserProfile.test.tsx](src/test/components/UserProfile.test.tsx)
  - [ ] Renders user info
  - [ ] "Reset Password" button triggers modal
  - [ ] "Delete Account" button triggers confirmation
- [ ] Create [src/test/components/BookingForm.test.tsx](src/test/components/BookingForm.test.tsx)
  - [ ] Displays event details
  - [ ] Submits booking
  - [ ] Shows success/error messages
- [ ] Create [src/test/components/AdminCalendar.test.tsx](src/test/components/AdminCalendar.test.tsx)
  - [ ] Lists events
  - [ ] "Create Event" form works
  - [ ] Edit/delete buttons functional (in UI)
- [ ] Run: `npm run test`

### 10.6 E2E Tests

- [ ] Create [src/test/e2e/booking-flow.test.ts](src/test/e2e/booking-flow.test.ts)
  - [ ] User views available events
  - [ ] User books event
  - [ ] Booking confirmed email sent
  - [ ] User can cancel booking
  - [ ] Cancellation email sent
- [ ] Create [src/test/e2e/password-reset-flow.test.ts](src/test/e2e/password-reset-flow.test.ts)
  - [ ] User requests password reset
  - [ ] Email sent with reset link
  - [ ] User clicks link, validates token
  - [ ] User sets new password
  - [ ] Can login with new password
- [ ] Create [src/test/e2e/admin-calendar-flow.test.ts](src/test/e2e/admin-calendar-flow.test.ts)
  - [ ] Admin creates calendar event
  - [ ] Event appears in public listing
  - [ ] Admin edits event
  - [ ] Admin deletes event
  - [ ] Cancellation emails sent to affected users
- [ ] Run: `npm run test`

---

## Phase 11: Code Quality & Documentation

### 11.1 Type Safety

- [ ] Verify: zero TypeScript compilation errors
- [ ] Check: all API response types defined
- [ ] Check: all component props typed
- [ ] Review: no `any` types
- [ ] Run: `npm run build`

### 11.2 Code Comments & JSDoc

- [ ] Add JSDoc comments to all utility functions
- [ ] Document: complex logic, edge cases
- [ ] Add: inline comments for non-obvious code
- [ ] Document: all API endpoints with request/response types

### 11.3 Accessibility Audit

- [ ] Verify: WCAG 2.1 Level AA compliance for new pages
- [ ] Check: ARIA labels on forms
- [ ] Check: keyboard navigation (Tab, Enter, Escape)
- [ ] Check: color contrast (4.5:1 minimum)
- [ ] Test: with screen reader (NVDA or JAWS)

### 11.4 Linting & Formatting

- [ ] Run: `npm run lint` — fix all warnings
- [ ] Run: `npm run format` (if available)
- [ ] Verify: no warnings in console

---

## Phase 12: Documentation & Deployment

### 12.1 Update Documentation

- [ ] Update [README.md](README.md): mention new features
- [ ] Add: troubleshooting section for common issues
- [ ] Update: environment variables if needed
- [ ] Add: changelog entry for this release

### 12.2 Database Backup

- [ ] Backup: production database before migration
- [ ] Test: migration in staging environment
- [ ] Document: rollback procedure (if needed)

### 12.3 Deployment

- [ ] Deploy: to staging environment
- [ ] Run: smoke tests (booking flow, email sending)
- [ ] Deploy: to production
- [ ] Monitor: error logs, email delivery
- [ ] Verify: all endpoints working

---

## Summary Checklist

**Database**: [ ] 5/5 models created  
**APIs**: [ ] 8/8 endpoints implemented  
**Frontend**: [ ] 5/5 pages created  
**Emails**: [ ] 4/4 templates added  
**Tests**: [ ] All unit, integration, E2E tests passing  
**Accessibility**: [ ] WCAG 2.1 AA compliance verified  
**Documentation**: [ ] Complete and up-to-date  
**TypeScript**: [ ] Zero compilation errors  
**Deployment**: [ ] Successful staging & production deployment  

---

**Notes**:
- Ticket scaffolding (Phase 9) is UI/wireframe only; full CRUD deferred to Phase 2
- All email templates use Mailgun with .ics attachments
- Capacity hardcoded to 2; can override per-event in admin form
- All bookings check capacity atomically before INSERT
- Soft deletes for compliance; audit trails complete

---

**Status Updates** (Update as progress is made):
- [ ] Started: [date]
- [ ] Database schema complete: [date]
- [ ] API endpoints complete: [date]
- [ ] Frontend pages complete: [date]
- [ ] Tests passing: [date]
- [ ] Deployment ready: [date]
