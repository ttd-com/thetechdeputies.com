# Project Tickets & Issues

This document contains a comprehensive list of tickets (Issues) covering completed Epics and outstanding items for `station.thetechdeputies.com`.

## 🔴 Outstanding Issues (High Priority)

### Issue #2: [CRITICAL] Site Unresponsive / Failed to Fetch
**Labels**: `bug`, `priority/highest`, `ops`
**Description**:
Production site `https://station.thetechdeputies.com` experienced downtime during VPS-based infrastructure period.
**Status**: RESOLVED - Migrated to Vercel.
**Context**:
- This issue occurred when infrastructure was self-hosted with PM2 and Caddy reverse proxy.
- Root causes included process deadlock and configuration issues inherent to self-hosted setup.
**Resolution**: Migrated to Vercel serverless platform for improved reliability and zero-config deployment.

## 🟢 Resolved Issues

### Issue #1: [BUG] Login 500 Internal Server Error (RESOLVED)
**Labels**: `bug`, `priority/critical`, `area/auth`, `resolved`
**Resolution**:
Migrated from SQLite + PM2 VPS infrastructure to PostgreSQL + Vercel. Updated NextAuth.js to v5 with Upstash Redis adapter. Removed SQLite dependency entirely.
**Description**:
Users were unable to log in to the production site. The authentication flow redirected to `/login?error=Configuration` or returned a 500 Internal Server Error on `/api/auth/providers`.
**Symptoms**:
- User clicks "Login", authenticates (or attempts to), and is redirected back to login.
- Console showed `GET /api/auth/providers 500 (Internal Server Error)`.
- Server logs showed configuration issues specific to SQLite and self-hosted setup.
**Previous Context**:
- Environment: Self-hosted VPS with PM2
- Stack: Next.js 14, NextAuth.js v4, SQLite
**Root Causes** (all resolved):
- SQLite write permissions issues on VPS
- `better-sqlite3` native compilation problems
- Configuration drift in self-hosted environment

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
- [x] **Vercel Deployment**: Configured auto-deployment from git with branch-based environments.
- [x] **Database Migration**: Migrated from SQLite to PostgreSQL with Prisma ORM.
- [x] **Session Management**: Configured Upstash Redis adapter for NextAuth.js v5.
- [x] **Security**: Configured environment variables in Vercel project settings (NEXTAUTH_SECRET, DATABASE_URL, REDIS_URL, etc.).
