# Project Tickets & Issues

This document contains a comprehensive list of tickets (Issues) covering completed Epics and outstanding items for `station.thetechdeputies.com`.

## 🔴 Outstanding Issues (High Priority)

### Issue #2: [CRITICAL] Site Unresponsive / Failed to Fetch
**Labels**: `bug`, `priority/highest`, `ops`
**Description**:
Production site `https://station.thetechdeputies.com` is failing to load. Browsers report "Failed to fetch RSC payload" or connection timeouts.
**Status**: verified down.
**Context**:
- Hard reset of PM2 and killing of zombie processes was attempted.
- Application process appears to start (PID exists) but port 3000 connectivity is intermittent or failing.
- Potential upstream Caddy issue or persistent process deadlock.
**Action Item**: Full server reboot or deep dive into Caddy logs and network configuration required.

## 🟢 Resolved Issues

### Issue #1: [BUG] Login 500 Internal Server Error (RESOLVED)
**Labels**: `bug`, `priority/critical`, `area/auth`, `resolved`
**Resolution**:
Found a stray `package-lock.json` in the user's home directory (`~`) which caused Next.js to misidentify the project root. Removed the file, rebuilt `better-sqlite3`, and restarted PM2. Verified via curl that `/api/auth/providers` returns 200 OK.
**Description**:
Users are unable to log in to the production site. The authentication flow redirects to `/login?error=Configuration` or returns a 500 Internal Server Error on `/api/auth/providers`.
**Symptoms**:
- User clicks "Login", authenticates (or attempts to), and is redirected back to login.
- Console shows `GET /api/auth/providers 500 (Internal Server Error)`.
- Server logs showed `UntrustedHost` (Resolved), but 500 persists.
**Context**:
- Environment: Production (VPS)
- Stack: Next.js 14, NextAuth.js v4, SQLite, PM2
**Suspected Causes**:
- Database write permissions for SQLite adapter.
- `better-sqlite3` native missing or compiled for wrong architecture.

---

## ✅ Completed Epics (For Record Keeping)

### Epic #4: Integrated Client Portal & Admin Dashboard
**Labels**: `epic`, `completed`
**Description**:
Implementation of the core user and admin dashboards.
**Completed Work**:
- [x] **Story 4.1**: Configured NextAuth.js with JWT sessions and credential/email providers.
- [x] **Story 4.2**: Built Client Hub (`/dashboard`) with responsive sidebar navigation.
- [x] **Story 4.3**: Integrated Mailgun for reliable password reset flows.
- [x] **Story 4.4**: Created Admin "Deputy Command Center" (`/dashboard/admin`) for system oversight.
- [x] **Story 4.5**: Implemented Acuity Scheduling webhook listener for syncing purchases.
- [x] **UI/UX**: Fixed sidebar positioning and header session awareness.

### Epic #5: Gift Certificate System
**Labels**: `epic`, `completed`
**Description**:
A complete system for purchasing, managing, and redeeming gift cards.
**Completed Work**:
- [x] **Database**: Schema designed for `gift_cards` (code, balance, status).
- [x] **API**:
    - `POST /api/gift-cards/create`: Admin endpoint to issue cards.
    - `POST /api/gift-cards/redeem`: User endpoint to apply balance.
    - `GET /api/gift-cards/check`: Public endpoint to check balance.
- [x] **UI**:
    - Admin management view (Create, List, Disable).
    - User dashboard view (View Code, Balance).
    - Email integration for sending codes.

### Epic #6: Course Purchase & Access System
**Labels**: `epic`, `completed`
**Description**:
The core revenue feature allowing users to buy and access educational courses.
**Completed Work**:
- [x] **Database**: Schema for `course_purchases` and `courses`.
- [x] **Components**:
    - `CourseEnrollButton`: Smart component handling "Buy" vs "Go to Course" logic.
    - `CoursePurchaseModal`: detailed checkout UI with Gift Card application.
- [x] **API**:
    - `POST /api/courses/purchase`: Handles transactions (Stripe stub + Gift Card logic).
    - `GET /api/courses/my-courses`: Retreives user's library.
    - `POST /api/courses/access`: Validates permissions for protected routes.
- [x] **Verification**: Verified end-to-end flow from Gift Card redemption to Course Access.

## 🚀 Infrastructure & Deployment
**Labels**: `infrastructure`, `completed`
**Description**:
Setup of the production environment and CI/CD pipelines.
**Completed Work**:
- [x] **Forgejo Workflow**: Created `deploy.yaml` using native `rsync`/`ssh` and NVM.
- [x] **Server Setup**: Configured Caddy reverse proxy for `station` and `bible` subdomains.
- [x] **Security**: Rotated `NEXTAUTH_SECRET` and secured `SSH_PRIVATE_KEY` with correct line endings.
- [x] **Permission Fixes**: Moved SQLite DB to user-space to resolve `EACCES` errors.
