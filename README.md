# The Tech Deputies

A dynamic tech education and support platform built with Next.js, featuring Acuity Scheduling integration for bookings, subscriptions, and gift certificates.

## Planning Documentation

For the complete planning context, see:
- **[Planning Session Summary](docs/planning-session.md)** - Structured overview of all decisions, specs, and architecture
- **[Original Planning Transcript](init_prompt.md)** - Raw BMad-Method session transcript for historical reference

## Project Overview

**Business Name:** The Tech Deputies
**Purpose:** Tech education and support services platform
**Status:** Active Development - Brownfield Migration (Static to Dynamic)

### Target Users

- **The Lifelong Learner**: Tech-curious individuals seeking structured education
- **The Support Seeker**: Users facing immediate tech hurdles who need quick scheduling

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Next.js 16+ (App Router) | Framework with SSR for secure API operations |
| React 19 | UI Library |
| Tailwind CSS 4 | Styling with brand color variables |
| TypeScript | Type safety |
| NextAuth.js v5 Beta | Authentication with Redis session store |
| Redis (Upstash) | Distributed session management |
| PostgreSQL/Prisma | Database for user profiles |
| Mailgun | Transactional emails (password reset) |
| Acuity Scheduling | Bookings, subscriptions, gift certificates |

## Getting Started

### Prerequisites

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **Docker** ([Download](https://www.docker.com/products/docker-desktop/)) - for PostgreSQL database

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/ttd-com/thetechdeputies.com.git
   cd thetechdeputies.com
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start PostgreSQL via Docker Compose:**
   ```bash
   docker compose up -d
   ```
   This starts a PostgreSQL container with credentials: `dev` / `devpass`

4. **Set up environment variables:**
   ```bash
   # .env.local is already created with defaults
   # For production features (email, Acuity), add your API keys:
   # MAILGUN_API_KEY=your-key
   # NEXT_PUBLIC_ACUITY_OWNER_ID=your-id
   ```

5. **Run database migrations:**
   ```bash
   npx prisma migrate deploy
   ```

6. **Start the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

### Useful Commands

```bash
# View database in browser UI
npx prisma studio

# Create a new database migration (after schema.prisma changes)
npx prisma migrate dev --name your_migration_name

# Reset database (dev only - destructive!)
npx prisma migrate reset

# Stop PostgreSQL
docker compose down

# Clear all data and restart
docker compose down -v && docker compose up -d
```

## Brand Identity

### Color Palette

| Color | Hex | Usage |
|-------|-----|-------|
| Primary (Teal) | `#39918C` | Primary buttons, main navigation, CTAs |
| Secondary (Navy) | `#2F435A` | Text, deep footers, contrast elements |
| Accent (Tan) | `#D0B49F` | Background sections, soft call-outs |
| Accent (Terracotta) | `#AB6B51` | Highlights, alerts, secondary actions |

### Design Principles

- **Clarity over Complexity**: Every screen focuses on a single primary action
- **Accessible by Default**: WCAG 2.1 Level AA compliance, ARIA labels throughout
- **Progressive Disclosure**: Information revealed only when relevant
- **Mobile-First**: Responsive design prioritizing mobile users

## Project Structure

```
the-tech-deputies/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/             # Password reset & login flows
│   │   ├── dashboard/          # Client Hub (Protected Portal)
│   │   ├── courses/            # Dynamic Course Catalog (/courses/[slug])
│   │   ├── booking/            # Acuity embed page
│   │   └── api/                # Serverless functions (Mailgun, Acuity)
│   ├── components/
│   │   ├── atoms/              # Buttons, Inputs, ARIA-labeled primitives
│   │   ├── molecules/          # Search bars, Course cards
│   │   └── organisms/          # Acuity Embed Wrapper, Nav, Footer
│   └── lib/                    # API clients (Mailgun, Acuity, Redis)
├── docs/                       # Planning artifacts (PRD, UI/UX Spec)
├── public/                     # Static assets
└── .env.local                  # Environment variables (Git-ignored)
```

## Development Backlog

### Epic 1: Project Foundation & Static-to-Dynamic Migration

| Story | Description | Status |
|-------|-------------|--------|
| 1.1 | Set up Tailwind CSS with brand color variables | Completed |
| 1.2 | Implement Atomic Design folder structure and base components with ARIA labels | Completed |
| 1.3 | Build base layout and navigation components | Completed |
| 1.4 | Accessibility audit of Acuity embed compatibility | Completed |

### Epic 2: Epic Landing Page & Course Catalog

| Story | Description | Status |
|-------|-------------|--------|
| 2.1 | Build Hero Section with high-contrast "Book Support" CTA | Completed |
| 2.2 | Implement Course Catalog with Grid (Template A) and List (Template B) views | Completed |
| 2.3 | Configure Dynamic Routing (`/courses/[slug]`) for course pages | Completed |

### Epic 3: Acuity Integration & Booking Flow

| Story | Description | Status |
|-------|-------------|--------|
| 3.1 | Create Booking page with embedded Acuity Scheduling widget | Completed |
| 3.2 | Apply custom CSS overrides to align Acuity with brand colors | Completed |
| 3.3 | Implement Subscription and Gift Certificate purchasing views | Completed |

### Epic 4: Integrated Client Portal & Admin Dashboard

| Story | Description | Status |
|-------|-------------|--------|
| 4.1 | Configure NextAuth.js with Redis adapter for session sync | Completed |
| 4.2 | Build Client Hub dashboard with sidebar and embedded management tools | Completed |
| 4.3 | Integrate Mailgun API for password reset and notifications | Completed |
| 4.4 | Create Admin "Deputy Command Center" dashboard | Completed |
| 4.5 | Implement Acuity webhook listener for purchase synchronization | Completed |

### Epic 5: Gift Certificate System

| Story | Description | Status |
|-------|-------------|--------|
| 5.1 | Database schema for gift_cards | Completed |
| 5.2 | API endpoints for create/redeem/check | Completed |
| 5.3 | Admin and User UI for gift card management | Completed |

### Epic 6: Course Purchase & Access System

| Story | Description | Status |
|-------|-------------|--------|
| 6.1 | Database schema for course_purchases | Completed |
| 6.2 | CourseEnrollButton and PurchaseModal components | Completed |
| 6.3 | Payment and Access API endpoints | Completed |

## Key Features

### Client Portal (Option B - Integrated)

- **My Sessions**: View upcoming and past Acuity appointments
- **Subscriptions**: Manage active plans, view renewal dates, upgrade options
- **Gift Cards**: Check balance, send to friends

### Admin Dashboard ("Deputy Command Center")

- **Overview Stats**: Monthly revenue, total sessions booked
- **User Management**: Client list with quick Acuity profile links
- **System Health**: Mailgun and Acuity API status indicators
- **Configuration**: Site-wide settings management

### Booking Flow ("Easy Experience")

1. User arrives at landing page
2. Clicks "Book Session" (high-contrast teal button)
3. Acuity scheduler appears (embedded, branded)
4. User selects time and pays
5. Confirmation with "Add to Calendar" and "Manage Subscription" options

## Environment Variables

Create a `.env.local` file with the following:

```env
# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Redis (Upstash)
REDIS_URL=your-redis-url
REDIS_TOKEN=your-redis-token

# Mailgun
MAILGUN_API_KEY=your-mailgun-api-key
MAILGUN_DOMAIN=your-domain.com

# Acuity Scheduling
ACUITY_USER_ID=your-user-id
ACUITY_API_KEY=your-api-key
```

## Accessibility Standards

- **WCAG 2.1 Level AA** compliance target
- All interactive elements include descriptive `aria-label` attributes
- Keyboard navigation fully supported (Tab key, focus indicators)
- High color contrast (4.5:1 minimum) for all text
- Screen reader compatibility with semantic HTML
- Dynamic status messages use `aria-live="polite"`

## Security Considerations

- API keys stored server-side only (never exposed to client)
- NextAuth.js with Redis for secure, distributed sessions
- Rate limiting on password reset endpoint (5 attempts/hour)
- Global session termination on logout
- Pre-build validation to prevent deployment without required env vars

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Architecture Decisions

### Why Next.js App Router?

- Server-side rendering for SEO and secure API operations
- Built-in API routes keep Mailgun/Acuity keys hidden from browser
- Simple deployment (Vercel, AWS, etc.)

### Why Redis for Sessions?

- Required for multi-server session synchronization
- Prevents users from being logged out when requests hit different servers
- Supports global session termination on logout

### Why Embedded Acuity (Option B)?

- Keeps users on your domain (builds trust)
- Consistent branding experience
- More "finished" feel than linking to external Acuity portal

## License

Proprietary - The Tech Deputies
