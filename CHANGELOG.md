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

### Known Issues
- None currently tracked.
