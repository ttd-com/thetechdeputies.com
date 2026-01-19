# The Tech Deputies - Copilot Instructions

AI agents should use this guide to quickly become productive in the codebase.

## Architecture Overview

**Stack**: Next.js 16+ (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Prisma (PostgreSQL) + NextAuth.js v5 Beta

### Key Services

- **Frontend Framework**: Next.js 16 with App Router; SSR for API routes, SSG for public pages
- **Database**: PostgreSQL via Prisma ORM; uses `@prisma/adapter-pg` for compatibility
- **Authentication**: NextAuth.js v5 (credentials-based); sessions stored in Upstash Redis via `@auth/upstash-redis-adapter`
- **Styling**: Tailwind CSS 4 with custom brand color variables (primary teal #39918C, secondary navy #2F435A, accent tan/terracotta)
- **External Integrations**: Acuity Scheduling (bookings, subscriptions, gift certificates), Mailgun (transactional emails)

### Database Schema Patterns

See [prisma/schema.prisma](../prisma/schema.prisma) for complete schema.

**Key models**:
- `User`: Core identity; `role` enum (USER/ADMIN); `emailVerified` for email verification flow
- `PasswordResetToken` & `EmailVerificationToken`: Single-use tokens with 24-hour expiry; `used` flag on reset tokens
- `CoursePurchase`: User course access; unique constraint on `(userId, courseSlug)`; tracks `status` (ACTIVE/REFUNDED/EXPIRED)
- `GiftCard`: Pre-purchase model with `originalAmount`/`remainingAmount`; transactions via `GiftCardTransaction`
- `RateLimit`: IP-based rate limiting; composite unique key `(ipAddress, endpoint)`

Naming convention: snake_case in database, `@map()` annotations ensure Prisma generates camelCase in code.

## Data Flow & Integration Points

### Authentication Flow

1. **Registration** (`/api/auth/register`): Creates user with bcrypt-hashed password; generates `EmailVerificationToken`; sends Mailgun email
2. **Login** (`/api/auth/[...nextauth]`): Credentials provider validates password; NextAuth creates session in Upstash Redis
3. **Session Management**: Middleware protects `/dashboard/*` routes; redirects unauthenticated users to `/login`

**Key file**: [src/lib/auth.config.ts](../src/lib/auth.config.ts)—defines JWT callbacks, session enrichment, role-based access control (admin routes check `role === 'admin'`)

### Course & Purchase Flow

1. **Course Catalog** (`/courses`): Static course data from [src/lib/courses.ts](../src/lib/courses.ts) (will migrate to database)
2. **Purchase** (`/api/courses/purchase`): Creates `CoursePurchase` record; optionally applies gift card via `giftCardCode`
3. **Access** (`/api/courses/access`): Checks `CoursePurchase` active status and expiry before granting access
4. **My Courses** (`/api/courses/my-courses`): Lists authenticated user's purchases; enriches with course metadata

### Acuity Scheduling Integration

[src/lib/acuity.ts](../src/lib/acuity.ts) builds embed URLs (scheduler, subscriptions, gift-certificates); configured via `NEXT_PUBLIC_ACUITY_OWNER_ID`.

**Embed pattern**: Use `AcuityEmbed` organism component; pass embed type and optional pre-selection options (appointmentType, calendarId)

### Admin Endpoints

Located under `/api/admin/*`; all require `auth.role === 'admin'`:
- `/admin/users`: User management
- `/admin/stats`: Analytics & metrics
- `/admin/settings`: System configuration
- `/admin/gift-cards`: Gift card operations

## Component Architecture (Atomic Design)

Files organized as `src/components/{atoms,molecules,organisms}/`; use barrel exports from [src/components/index.ts](../src/components/index.ts).

### Atoms (Primitives)
- `Button`: Variant-based (primary/secondary/accent/outline/ghost); size prop (sm/md/lg); supports `isLoading`, `leftIcon`, `rightIcon`; **always include `aria-label` when text children absent**
- `Input`: Form input with label, error state, accessibility attributes
- `Card`: Container with padding, border, shadow
- `SkipLink`: Skip-to-main navigation for WCAG 2.1 Level AA

### Molecules (Composite)
- `CourseCard`, `CourseListItem`: Display course with purchase button
- `PlanCard`: Subscription/gift card option
- `Hero`: Homepage banner with CTA

### Organisms (Complex)
- `Header`, `Footer`: Site chrome; navigation
- `CourseCatalog`: Grid/list view toggle with filtering
- `CoursePurchaseModal`: Modal flow for course purchase
- `AcuityEmbed`: Wraps iframe for Acuity embeds; applies brand CSS overrides
- `SessionProvider`: Wraps app with auth context

## Developer Workflows

### Build & Run

```bash
npm run dev        # Local dev server (http://localhost:3000); hot reload
npm run build      # Runs 'prisma generate && next build'; type checks and builds production bundle
npm start          # Runs production server
npm run lint       # ESLint check
```

**Postinstall hook**: Runs `prisma generate` to ensure Prisma client is generated after dependency installs.

### Database

```bash
# Migrations (when schema changes)
npx prisma migrate dev --name <migration_name>

# Reset (dev only; destructive)
npx prisma migrate reset

# View data
npx prisma studio
```

**Important**: Schema uses PostgreSQL; local development requires `.env.local` with `DATABASE_URL` pointing to local or remote Postgres instance.

### Debugging

Use [src/lib/logger.ts](../src/lib/logger.ts) for structured logging:
```typescript
import { logger } from '@/lib/logger';
logger.info("User created", { userId: user.id, email: user.email });
logger.error("Payment failed", error, { courseSlug: purchase.courseSlug });
```

Logs include timestamp, level (INFO/WARN/ERROR/DEBUG), and context; JSON output in production for parsing.

## Project-Specific Conventions

### File Naming & Imports

- Route files: `route.ts` (HTTP handlers)
- Component files: PascalCase (e.g., `Button.tsx`)
- Library files: camelCase (e.g., `auth.config.ts`)
- Path alias: `@/` points to `src/`; use consistently for imports

### TypeScript Patterns

- Prefer interfaces for component props; named exports for types
- Use type guards for discriminated unions (e.g., `role: 'admin' | 'user'`)
- Enum usage: See Prisma schema for mapped enums (e.g., `Role { USER @map("user"), ADMIN @map("admin") }`)

### API Response Patterns

All API routes return `NextResponse.json()`:
- Success: `{ data, count?, message? }` with status 200
- Errors: `{ error: string }` with appropriate status (400 bad request, 401 unauthorized, 409 conflict, 500 server error)
- Always wrap in try-catch; log errors via `logger.error()`

### Styling & Tailwind

Tailwind 4 with PostCSS; brand color variables:
- Primary: `bg-primary text-primary border-primary` (#39918C teal)
- Secondary: `bg-secondary text-secondary` (#2F435A navy)
- Accent: `bg-accent-tan bg-accent-terracotta` (tan #D0B49F, terracotta #AB6B51)

Focus states: `focus-visible:ring-{color}` for all interactive elements.

### Accessibility Requirements

All components must meet WCAG 2.1 Level AA:
- Buttons: Always provide `aria-label` if text not present
- Forms: `<label>` with `htmlFor` attribute; error messages linked via `aria-describedby`
- Navigation: Semantic HTML (`<nav>`, `<main>`, `<footer>`); Skip Links implemented
- Acuity embeds: Wrapped in `<iframe title="...">` for screen readers

## Deployment & Environment

**Branch strategy**: `main` deploys to staging (station.thetechdeputies.com); `production` branch for production (future).

**Environment variables** (set in Vercel project settings or `.env.local`):
- `NEXTAUTH_SECRET`: Session encryption key (generate: `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Auth callback URL
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`, `REDIS_TOKEN`: Upstash Redis
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`: Email configuration
- `NEXT_PUBLIC_ACUITY_OWNER_ID`: Public; used in client-side Acuity embed URLs

CI/CD: Vercel auto-deploys on git push; build runs `prisma generate && next build`.

## Common Tasks

### Add a New API Route
1. Create `src/app/api/{feature}/route.ts`
2. Export `GET`, `POST`, etc. async functions
3. Call `await auth()` to check authentication
4. Query database via Prisma or db functions
5. Return `NextResponse.json(data, { status })` or errors

### Add a New Course
Edit [src/lib/courses.ts](../src/lib/courses.ts); add entry to `sampleCourses[]` array with required fields (slug, title, category, level, topics, learningOutcomes). In production, migrate to database queries.

### Modify Acuity Integration
Update [src/lib/acuity.ts](../src/lib/acuity.ts) to add new embed types or options. Adjust CSS overrides in [src/components/organisms/AcuityEmbed.tsx](../src/components/organisms/AcuityEmbed.tsx).

### Update Authentication Rules
Edit [src/lib/auth.config.ts](../src/lib/auth.config.ts) `authorized` callback; specify protected routes and role checks.

### Add Admin Functionality
1. Create endpoint under `/api/admin/{feature}`
2. Check auth and role in handler
3. Restrict UI route under `/dashboard/admin/` (protected by auth config)
4. Add admin dashboard page under `src/app/dashboard/admin/{feature}/page.tsx`

## Key File References

- **Auth & Session**: [src/lib/auth.config.ts](../src/lib/auth.config.ts), [middleware.ts](../middleware.ts)
- **Database**: [prisma/schema.prisma](../prisma/schema.prisma), [src/lib/db.ts](../src/lib/db.ts)
- **Courses**: [src/lib/courses.ts](../src/lib/courses.ts)
- **Acuity**: [src/lib/acuity.ts](../src/lib/acuity.ts)
- **Logging**: [src/lib/logger.ts](../src/lib/logger.ts)
- **Components**: [src/components/](../src/components/)
- **API Routes**: [src/app/api/](../src/app/api/)
- **Pages**: [src/app/](../src/app/)

---

**Last Updated**: 2026-01-18 | **Version**: 1.0
