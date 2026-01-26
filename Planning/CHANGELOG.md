# Changelog

## [Unreleased]

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
