# Changelog

## [Unreleased]

## [2.0.0] - 2026-02-01

### Added
- **Calendar & Booking System**:
    - Calendar event management with 1-hour slots (10am-4pm)
    - Capacity management (2-person limit per slot)
    - Booking creation, viewing, and cancellation
    - Email confirmations with ICS calendar invites
    - `/api/calendar-events` endpoints (GET, POST, PATCH, DELETE)
    - `/api/bookings` endpoints for user bookings
    - `src/lib/calendar.ts` - Slot generation and date formatting
    - `src/lib/calendar-invites.ts` - ICS file generation
- **User Management Enhancements**:
    - Soft delete pattern for users (with restore capability)
    - `/dashboard/admin/users` - Enhanced list with email verification
    - `/dashboard/admin/users/[id]` - User detail page with full CRUD
    - `/api/admin/users/[id]/verify-email` - Manual email verification endpoint
    - User restoration when re-registering with deleted email
    - Fixed joined date display (createdAt field mapping)
- **Revenue & Subscription Tracking**:
    - Stripe integration with `src/lib/stripe.ts`
    - Monthly Recurring Revenue (MRR) calculation
    - Active subscription count from Stripe
    - Current month revenue tracking
    - `/api/admin/revenue` - Revenue metrics endpoint
    - `/api/admin/subscriptions` - Subscription details endpoint
    - `/dashboard/admin/revenue` - New revenue dashboard page
- **Enhanced Admin Dashboard**:
    - `/dashboard/admin` - Clickable cards linking to relevant pages
    - Real-time data from database and Stripe
    - Total users, revenue, sessions booked, active subscriptions
- **Booking Pages**:
    - `/booking` - User-facing calendar with available sessions
    - `/dashboard/sessions` - View upcoming and past bookings
    - Booking confirmation and cancellation flows
- **Credentials Testing**:
    - `scripts/credentials-test.ts` - Verify all API keys and service connections
    - Tests Mailgun, PostgreSQL, Redis configurations
- **Dependencies**:
    - Added `stripe@^20.3.0` for payment processing
    - Added `@stripe/stripe-js@^8.7.0` for client-side Stripe

### Fixed
- **Joined Date Display**: Fixed camelCase mapping issue on admin users page
- **User Registration**: Users can now re-register with soft-deleted email addresses
- **Booking Page**: Removed leftover Acuity embed code causing build error

### Changed
- **Registration Flow**: Enhanced to restore soft-deleted accounts when re-registering
- **User Lookup**: `getUserByEmail()` now excludes soft-deleted users
- **Admin Dashboard**: Real data from multiple sources instead of placeholders

### Database
- New `CalendarEvent` model with capacity and booking tracking
- New `Booking` model with status and cancellation tracking
- New `Ticket` and `TicketComment` models for future support system
- Added `deletedAt` field to User model for soft deletes
- Database migration: `20260201063445_add_user_management_and_calendaring`

## [1.x.x] - Previous releases
...

### Added
- **Course Purchase System**:
    - `course_purchases` database table.
    - `/api/courses/purchase` endpoint with Gift Card support.
    - `/api/courses/my-courses` endpoint for user access.
    - `CourseEnrollButton` with smart status checking.
    - Purchase Modal with real-time price calculation.
- **My Courses Dashboard**: New page at `/dashboard/courses` listing purchased content.
- **Deployment**:
    - Forgejo workflow `deploy.yaml`.
    - Production `setup_secrets.ps1` script (local).
    - Caddy configuration instructions.
 - **Environment Toggle**:
     - Added `DB_HOST_LOCAL` toggle to prefer local or remote database connections during development and deployment.
     - Introduced `DATABASE_URL_LOCAL` and `DATABASE_URL_REMOTE` along with a `getDatabaseUrl()` helper (`src/lib/env.ts`) to select the active DB URL.
     - Updated `prisma/prisma.config.ts`, `src/lib/db.ts`, and `scripts/seed-dev-user.ts` to respect the toggle.

### Fixed
- **Login 500 Error**: Resolved authentication flow error caused by stray `package-lock.json` in user home directory.
- **Deployment Pipeline**:
    - Switched runner to `ubuntu-latest`.
    - Replaced external actions with native `rsync`/`ssh`.
    - Implemented NVM for user-space (sudo-less) Node.js/PM2 management.
    - Resolved port 3000 conflict with existing Wiki.js service.
- **Server Configuration**:
    - Fixed `authorized_key` vs `authorized_users` mismatch.
    - Configured `AUTH_TRUST_HOST=true` for NextAuth behind proxy.

### Changed
- **Database**: Moved production SQLite file from `/var/lib` to application directory for better portability and permission management.
- **Secrets**: Rotated `NEXTAUTH_SECRET` to a secure 64-char string.

### Security
- **Security Audit (2026-01-24)**: Performed a repository security audit. Findings and actions:
    - Found developer secrets present in `.env.local` (local dev file). These values are sensitive and should be rotated immediately (Mailgun API key, `DATABASE_URL`, `REDIS_TOKEN`, `NEXTAUTH_SECRET`).
    - Confirmed `.gitignore` already ignores `.env*` (except `.env.example`) so local env files are not tracked. `.env.local` was not committed.
    - Patched a Prisma enum validation issue in `src/lib/db.ts` to ensure the `role` field is passed as the expected value.
    - Recommendation: Rotate any exposed credentials and store production secrets in a secrets manager or CI/CD encrypted secrets.

### Changed
- **Environment handling**: Runtime and CLI now support `DB_HOST_LOCAL` (true/false) to switch between local and remote DB endpoints; falls back to `DATABASE_URL` when unset.

### Known Issues
- None currently tracked.
