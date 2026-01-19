# The Tech Deputies - Planning Session Summary

This document captures the key decisions and specifications from the BMad-Method planning session.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Enhancement Scope](#enhancement-scope)
3. [Goals & Requirements](#goals--requirements)
4. [UI/UX Specification](#uiux-specification)
5. [Technical Architecture](#technical-architecture)
6. [Development Backlog](#development-backlog)
7. [Critical Review & Risk Mitigation](#critical-review--risk-mitigation)
8. [Session Synchronization Strategy](#session-synchronization-strategy)
9. [Security & Testing Gates](#security--testing-gates)

---

## Project Overview

**Business Name:** The Tech Deputies
**Project Type:** Brownfield (Static to Dynamic Migration)
**Primary Purpose:** Tech education and support services

### Current State
- Static site template
- Informational only; lacks dynamic interactivity
- No integrated commerce or booking capability

### Target State
- Dynamic Next.js application
- Acuity Scheduling integration (bookings, subscriptions, gift certificates)
- Integrated Client Portal with authentication
- Admin Dashboard ("Deputy Command Center")

---

## Enhancement Scope

### Enhancement Types
- [x] New Feature Addition: Client booking and payment systems
- [x] Integration with New Systems: Acuity Scheduling
- [x] Major Feature Modification: Static to dynamic transition
- [x] UI/UX Overhaul: Creating an "easy experience"

### Impact Assessment
**Level:** Major Impact
**Rationale:** Requires backend/serverless architecture and deep third-party API integration

---

## Goals & Requirements

### Primary Goals
1. Seamlessly integrate Acuity Scheduling for all booking and payment workflows
2. Enable self-service subscription management and gift certificate purchasing
3. Provide a frictionless, "easy" user experience

### Success Metrics
- **Primary KPI:** 100% of booking/subscription workflows completed on-site without errors
- **Accessibility Target:** WCAG 2.1 Level AA compliance on all core pages
- **User Experience:** Time to book under 3 minutes for new users
- **Operational Efficiency:** 0% manual admin work for gift certificates and renewals

### Accessibility Requirements (WCAG 2.1 Level AA)
- Screen reader compatibility with semantic HTML and ARIA labels
- Full keyboard navigation for all workflows
- High color contrast (4.5:1 minimum)
- Clear focus indicators

---

## UI/UX Specification

### Brand Identity
| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Teal) | `#39918C` | Primary buttons, navigation, CTAs |
| Secondary (Navy) | `#2F435A` | Text, footers, contrast elements |
| Accent (Tan) | `#D0B49F` | Background sections, soft call-outs |
| Accent (Terracotta) | `#AB6B51` | Highlights, alerts, secondary actions |

### Target User Personas

**The Lifelong Learner**
- Tech-curious individuals seeking structured education
- Need clear, non-intimidating booking process

**The Support Seeker**
- Users facing immediate tech hurdles
- Prioritize speed and clarity in scheduling

### Design Principles
1. **Clarity over Complexity:** Single primary action per screen
2. **Accessible by Default:** ARIA labels and WCAG compliance from the start
3. **Progressive Disclosure:** Information revealed only when relevant
4. **Mobile-First:** Responsive design prioritizing mobile users

### Site Map
- **Home:** Hero section with mission and "Book Support" CTA
- **Services/Education:** Tech education offerings
- **Booking Portal:** Embedded Acuity scheduler
- **Subscriptions:** Recurring support/education plans
- **Gift Certificates:** Digital gift cards
- **Client Hub:** Manage appointments and subscriptions (protected)
- **Admin Dashboard:** Deputy Command Center (protected)

### User Flow ("Easy Experience")
1. User arrives at landing page
2. Clicks "Book Session" (high-contrast teal button)
3. Acuity scheduler appears (embedded)
4. User selects time and pays
5. Confirmation with "Add to Calendar" and "Manage Subscription" options

### Portal Decision
**Selected: Option B - Integrated Portal**
- Lightweight "Member Area" on the site with embedded Acuity management
- Requires NextAuth.js authentication
- Mailgun integration for password resets
- Admin dashboard for site management

---

## Technical Architecture

### Tech Stack
| Technology | Purpose |
|------------|---------|
| Next.js 14+ (App Router) | Framework with SSR |
| Tailwind CSS | Styling with brand variables |
| TypeScript | Type safety |
| NextAuth.js | Authentication |
| Redis (Upstash) | Distributed session management |
| PostgreSQL/Prisma | User profiles database |
| Mailgun | Transactional emails |
| Acuity Scheduling | Bookings, subscriptions, gift certificates |

### Project Structure
```
src/
├── app/
│   ├── api/
│   │   ├── auth/           # NextAuth & Password Reset routes
│   │   └── acuity/         # Secure Acuity proxy routes
│   ├── (auth)/             # Password reset & login flows
│   ├── dashboard/          # Client Hub (Protected Portal)
│   ├── courses/            # Dynamic Course Catalog
│   └── booking/            # Acuity embed page
├── components/
│   ├── atoms/              # Buttons, Inputs, ARIA-labeled primitives
│   ├── molecules/          # Search bars, Course cards
│   └── organisms/          # Acuity Embed Wrapper, Nav, Footer
└── lib/
    ├── mailgun.ts          # Server-side Mailgun client
    └── redis.ts            # Shared Redis connection
```

### Key Architectural Decisions

**Why Next.js App Router?**
- Server-side rendering for SEO and secure API operations
- Built-in API routes keep credentials hidden from browser
- Simple deployment on Vercel/AWS

**Why Redis for Sessions?**
- Multi-server session synchronization
- Prevents logout on server routing changes
- Supports global session termination

**Why Embedded Acuity (Option B)?**
- Keeps users on domain (builds trust)
- Consistent branding experience
- More "finished" feel than external links

---

## Development Backlog

### Epic 1: Project Foundation & Static-to-Dynamic Migration
| Story | Description |
|-------|-------------|
| 1.1 | Set up Next.js project with Tailwind CSS and brand variables |
| 1.2 | Implement Atomic Design folder structure and base components with ARIA labels |
| 1.3 | Migrate existing static content into Next.js layouts |
| 1.4 | Accessibility audit of Acuity embed compatibility |

### Epic 2: Epic Landing Page & Course Catalog
| Story | Description |
|-------|-------------|
| 2.1 | Build Hero Section with high-contrast CTAs and responsive design |
| 2.2 | Implement Course Catalog with Grid (Template A) and List (Template B) views |
| 2.3 | Configure Dynamic Routing (`/courses/[slug]`) |

### Epic 3: Acuity Integration & Booking Flow
| Story | Description |
|-------|-------------|
| 3.1 | Create Booking page with embedded Acuity widget |
| 3.2 | Apply custom CSS overrides for brand alignment |
| 3.3 | Implement Subscription and Gift Certificate views |

### Epic 4: Integrated Client Portal & Admin Dashboard
| Story | Description |
|-------|-------------|
| 4.1 | Configure NextAuth.js with Redis adapter |
| 4.2 | Build Client Hub dashboard with sidebar navigation |
| 4.3 | Integrate Mailgun API for password reset |
| 4.4 | Create Admin "Deputy Command Center" |
| 4.5 | Implement Acuity webhook listener for purchase sync |

---

## Critical Review & Risk Mitigation

### Technical Risks Identified

**1. Acuity Iframe Limitations**
- Third-party cookie restrictions in Safari/ITP
- Risk: Booking flow breaks if iframe blocked
- Mitigation: Test across browsers, provide fallback link

**2. Mailgun API Exposure**
- Risk: Rate abuse for spam
- Mitigation: Rate limiting (5 attempts/hour) on password reset

**3. Session Synchronization**
- Risk: User logged out when routed to different server
- Mitigation: Redis shared session store

**4. Accessibility in Iframes**
- Risk: ARIA labels may not reach inside Acuity iframe
- Mitigation: Wrapper components with proper context labels

**5. Course Catalog Access Control**
- Risk: No sync between Acuity purchases and course access
- Mitigation: Story 4.5 - Webhook listener for purchase sync

### Recommended Must-Fix Items
1. Add Story 4.5 (Webhook Listener) for Acuity purchase sync
2. Add Story 1.4 (Accessibility Audit) for Acuity embed
3. Define explicit "Sign-out" behavior for global session termination

---

## Session Synchronization Strategy

### Infrastructure Requirements
- **Redis (Upstash):** Shared session store for multi-server sync
- **PostgreSQL:** User profiles linked to `acuityClientId`
- **Mailgun:** Transactional emails (password reset, magic links)

### Session Patterns

**A. Global Session Termination**
- On logout, trigger server-side webhook to clear session across all services
- Use NextAuth.js `signOut` callback

**B. Silent Refresh Pattern**
- Check Acuity token validity in session callback
- Silently refresh expiring tokens server-side

**C. SSR-First Data Fetching**
- Pre-fetch user data on server before rendering `/dashboard`
- Eliminates loading flickers

### Environment Variables

**Core System Variables (`.env.local` only):**
```env
# NextAuth (must be in .env - cannot be stored in DB)
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Redis (must be in .env - required for session management)
REDIS_URL=your-redis-url
REDIS_TOKEN=your-redis-token

# Database (must be in .env)
DATABASE_URL=your-database-url
```

**Admin-Manageable API Keys:**
The following API keys should be stored in the database and managed through the Admin Dashboard:
- **Mailgun API Key & Domain** - Configurable for transactional emails
- **Acuity User ID & API Key** - Configurable for scheduling integration

This allows admins to rotate keys without redeploying the application. Keys stored in the database should be encrypted at rest.

---

## Security & Testing Gates

### Gate 1: Secret Leak Build Fail
Pre-build script checks for required environment variables. Missing keys = build failure.

### Gate 2: Session Synchronization Test
| Scenario | Expected Outcome |
|----------|------------------|
| Cross-Server Continuity | User remains logged in when routed to different server |
| Global Logout | Session purged from Redis; all servers reject requests |
| Third-Party Iframe | Portal session remains active with iframe cookies |

### Gate 3: Accessibility (ARIA) Validation
- Wrapper components provide context for screen readers
- Container `aria-label="Tech Support Booking Interface"`
- Focus management traps focus in modals

### API Protection
- Rate limiting on `/api/auth/reset` (5 attempts/hour)
- `429 Too Many Requests` after threshold

---

## Sprint Strategy

**Sprint 1: The Foundation** (Epic 1 & 2)
- Get brand online with course catalog visible
- Build foundation while planning complex portal logic

**Sprint 2: Acuity Integration** (Epic 3)
- Booking flows and embed styling

**Sprint 3: Portal & Auth** (Epic 4)
- Full client portal and admin dashboard

---

*Document generated from BMad-Method planning session*
