# The Tech Deputies - Agent Instructions

This file contains essential information for AI agents working in this codebase.

## 🚀 Current Session Status (Last Updated: Feb 1, 2026)

**System Status**: 🟢 PRODUCTION READY  
**Webhook Configuration**: ✅ COMPLETE  
**Last Commit**: Webhook setup & documentation complete  

### Key Changes This Session
- ✅ Verified complete webhook integration
- ✅ Created comprehensive system maps in `/maps/` directory (4 files, 2,898 lines, 50+ diagrams)
- ✅ Updated all documentation to reflect production-ready status
- ✅ System coverage: 98% integrations verified
- ✅ Coverage score: 88% (up from 85%)

### For Next Session - Start Here
1. **Read**: `/maps/INDEX.md` - Navigation guide to all documentation
2. **Status**: Check `/maps/AUDIT_REPORT.md` - Production readiness checklist
3. **Details**: See `/maps/fullmap.md` - Complete system overview
4. **Zones**: Reference `/maps/zonemaps.md` - Area-specific deep dives
5. **Context**: Read `Planning/SESSION_COMPLETION_REPORT_FEB1_WEBHOOKS.md` - This session's work

### Current Infrastructure Status
- Database: PostgreSQL with 14 models (all functional)
- Auth: NextAuth.js v5 + Upstash Redis (working)
- Payments: Stripe integration (webhooks active)
- Email: Mailgun queue system (functional)
- Scheduling: Acuity integration (ready)
- Deployment: Vercel (auto-deploy on push)

### Known Issues: NONE
All critical issues resolved. See `/maps/AUDIT_REPORT.md` for non-critical enhancements list.

## Quick Start Commands

### Workspace Management
```bash
# From project root, manage multiple websites in /Websites
bun workspace --help                          # List all projects
bun workspace <project> <command>             # Run command in specific project
bun workspace thetechdeputies.com dev        # Start dev server
bun dev                                        # Shorthand for thetechdeputies.com dev
```

### Development (within website directory)
```bash
bun install             # Install dependencies (run once)
bun run dev             # Start development server (http://localhost:3000)
bun run build           # Production build with type checking
bun start               # Run production server
bun run lint            # ESLint code quality checks
```

### Database Operations
```bash
bun prisma migrate dev --name <migration_name>    # Create and apply migration
bun prisma migrate reset                           # Reset database (dev only)
bun prisma studio                                  # Database browser UI
bun prisma generate                                # Regenerate Prisma client
```

### Testing
```bash
bun run test            # Run tests
bun run test:watch      # Watch mode
bun run test:coverage   # Coverage report
```

## Project Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Prisma (PostgreSQL) + NextAuth.js v5

**Key Services**:
- Frontend: Next.js with SSR for API routes, SSG for public pages
- Database: PostgreSQL via Prisma ORM
- Authentication: NextAuth.js v5 credentials provider with Upstash Redis sessions
- Styling: Tailwind CSS 4 with custom brand colors
- External: Acuity Scheduling, Mailgun emails

### Workspace Structure

```
Projects/thetechdeputies.com/
├── Websites/               # Multiple website projects
│   └── thetechdeputies.com/
│       ├── src/            # Website code only
│       ├── prisma/         # Database schema
│       └── package.json
├── Scripts/                # Workspace management scripts
│   └── run-workspace.js    # Dynamic project runner
├── Planning/               # Documentation & guidelines
│   ├── AGENTS.md
│   ├── WEBSITE_SOURCE_POLICY.md
│   └── ...
└── package.json            # Root workspace config
```

⚠️ **IMPORTANT**: The `/src` directory is **EXCLUSIVELY** for website code. No internal tools, experiments, or unrelated projects should be added here.

**See** [WEBSITE_SOURCE_POLICY.md](WEBSITE_SOURCE_POLICY.md) **for detailed guidelines on what belongs in `/src`.**

## Code Style Guidelines

### File Naming & Structure
- Components: `PascalCase.tsx` (e.g., `Button.tsx`, `CoursePurchaseModal.tsx`)
- API routes: `route.ts` (HTTP handlers)
- Libraries: `camelCase.ts` (e.g., `auth.config.ts`, `courses.ts`)
- Path alias: Use `@/` for all imports pointing to `src/`

### Component Architecture (Atomic Design)
```
src/components/
├── atoms/          # Primitives (Button, Input, Card, SkipLink)
├── molecules/      # Composite components (Hero, CourseCard, PlanCard)
└── organisms/      # Complex components (Header, Footer, CourseCatalog)
```

### TypeScript Patterns
- Use interfaces for component props with named exports
- Strict mode enabled - all types must be explicit
- Prefer type guards for discriminated unions
- Database models: snake_case in DB, camelCase in code via `@map()`

### Import Conventions
```typescript
// External libraries first
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth.config';

// Internal imports with @/ alias
import { logger } from '@/lib/logger';
import { Button } from '@/components/atoms/Button';
```

### API Response Patterns
All API routes return structured responses:
```typescript
// Success
NextResponse.json({ data: result, count: results.length }, { status: 200 });

// Error
NextResponse.json({ error: "Descriptive message" }, { status: 400 });
```

Always wrap in try-catch and log errors via `logger.error()`.

### Styling Guidelines
- Use Tailwind CSS classes only
- Brand colors: `bg-primary` (#39918C), `bg-secondary` (#2F435A), `bg-accent-tan` (#D0B49F)
- Focus states: `focus-visible:ring-{color}` for interactive elements
- Responsive design: Mobile-first approach

### Error Handling
- Use structured logging from `@/lib/logger`
- Log levels: `info()`, `warn()`, `error()`, `debug()`
- Include context objects in logs
- API errors: Always return proper HTTP status codes

### Accessibility Requirements (WCAG 2.1 Level AA)
- Buttons: Include `aria-label` when text content is absent
- Forms: Use `<label>` with `htmlFor`, link errors via `aria-describedby`
- Navigation: Semantic HTML (`<nav>`, `<main>`, `<footer>`)
- Skip links: Implement for keyboard navigation
- Iframes: Include descriptive `title` attribute

## Database Patterns

### Key Models
- `User`: Core identity with role enum (USER/ADMIN)
- `CoursePurchase`: User course access with unique `(userId, courseSlug)` constraint
- `GiftCard`: Pre-purchase model with amount tracking
- `PasswordResetToken`/`EmailVerificationToken`: Single-use tokens with expiry

### Database Conventions
- Use Prisma for all database operations
- Migrations required for schema changes
- Snake_case in database, camelCase in code
- Always use transactions for multi-record operations

### ⚠️ CRITICAL: Prisma Enum Compatibility (Vercel Build Issue)

**Problem**: Vercel builds fail with enum type errors like `Type '"ADMIN"' is not assignable to type 'Role'` even though local builds succeed. This is caused by a version mismatch between Prisma 7.2.0 (Vercel) and Prisma 7.3.0+ (local).

**Root Cause**: Prisma changed enum handling between versions:
- Prisma 7.2.0 expects **lowercase** enum values in assignments: `role: 'admin'`
- Prisma 7.3.0+ expects **uppercase** enum values: `role: 'ADMIN'` or `Role.ADMIN`

**Solution Pattern**: Use lowercase values with `as any` type assertion for cross-version compatibility:

```typescript
// ✅ CORRECT - Works on both Vercel (7.2.0) and local (7.3.0+)
await db.user.create({
  data: {
    role: 'admin' as any,           // Not 'ADMIN'
    status: 'active' as any,        // Not 'ACTIVE'
  }
});

// ✅ CORRECT - Comparisons use lowercase strings directly
if (user.role === 'admin') { }
if (subscription.status === 'active') { }
if (booking.status === 'cancelled') { }

// ❌ WRONG - Will fail on Vercel
role: 'ADMIN',                      // Type error on Prisma 7.2.0
status: 'ACTIVE',                   // Type error on Prisma 7.2.0
changeType: 'ADMIN_RESET',          // Type error on Prisma 7.2.0
```

**Affected Enums**:
- `Role`: `'admin' as any`, `'user' as any`
- `SubscriptionStatus`: `'active' as any`, `'cancelled' as any`, `'expired' as any`, `'past_due' as any`
- `ChangeType`: `'admin_reset' as any`, `'admin_force_change' as any`
- `BookingStatus`: `'cancelled' as any`

**Verification Command**: Scan for uppercase enum values before deploying:
```bash
grep -rn "role: 'ADMIN'\|role: 'USER'\|status: 'ACTIVE'\|status: 'CANCELLED'\|status: 'EXPIRED'" src/
```

**Note**: Stripe API calls always use lowercase (e.g., `subscription.status = 'active'`) - these are NOT Prisma enums and don't need type assertions.

## Authentication & Authorization

### Session Management
- NextAuth.js v5 with credentials provider
- Sessions stored in Upstash Redis
- Middleware protects `/dashboard/*` routes
- Role-based access control for admin features

### Auth Patterns
```typescript
// Check authentication in API routes
const session = await auth();
if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

// Admin role check
if (session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
```

## Common Implementation Patterns

### Adding New API Routes
1. Create `src/app/api/{feature}/route.ts`
2. Export async functions: `GET`, `POST`, `PUT`, `DELETE`
3. Check authentication via `await auth()`
4. Use Prisma for database operations
5. Return structured JSON responses

### Creating New Components
1. Choose appropriate atomic design level
2. Use TypeScript interfaces for props
3. Include accessibility attributes
4. Add proper error boundaries
5. Export via barrel index files

### Database Schema Changes
1. Update `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <description>`
3. Regenerate client: `npx prisma generate`
4. Update TypeScript types as needed

## Environment Configuration

### Required Environment Variables
- `NEXTAUTH_SECRET`: Session encryption key
- `NEXTAUTH_URL`: Auth callback URL
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`, `REDIS_TOKEN`: Upstash Redis (optional)
- `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`: Email service
- `NEXT_PUBLIC_ACUITY_OWNER_ID`: Acuity scheduling

### Development Setup
1. Install dependencies: `npm install`
2. Set up PostgreSQL (local or remote)
3. Configure `.env.local` with required variables
4. Run database migrations: `npx prisma migrate dev`
5. Start dev server: `npm run dev`

## Key File Locations

- **Auth Config**: `src/lib/auth.config.ts`
- **Database**: `src/lib/db.ts`, `prisma/schema.prisma`
- **Logging**: `src/lib/logger.ts`
- **Courses**: `src/lib/courses.ts`
- **Acuity Integration**: `src/lib/acuity.ts`
- **Components**: `src/components/`
- **API Routes**: `src/app/api/`
- **Middleware**: `middleware.ts`

## Deployment Notes

- **Platform**: Vercel (serverless)
- **Build Process**: `prisma generate && next build`
- **Branch Strategy**: `main` → staging, `production` → live
- **CI/CD**: Auto-deploy on git push

## Agent Best Practices

1. **Always run linting**: `npm run lint` before completing tasks
2. **Check types**: TypeScript compilation errors must be resolved
3. **Test auth flows**: Verify authentication works for protected routes
4. **Database safety**: Use migrations, never manual schema changes
5. **Accessibility first**: All new components must meet WCAG 2.1 Level AA
6. **Error logging**: Use structured logging for debugging
7. **Security**: Never expose secrets, always validate inputs

---

**Last Updated**: 2026-01-20 | **Based on**: v0.1.0 | **Framework**: Next.js 16 + React 19