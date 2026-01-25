# The Tech Deputies - Agent Instructions

This file contains essential information for AI agents working in this codebase.

## Quick Start Commands

### Development
```bash
npm run dev              # Start development server (http://localhost:3000)
npm run build            # Production build with type checking
npm start                # Run production server
npm run lint             # ESLint code quality checks
```

### Database Operations
```bash
npx prisma migrate dev --name <migration_name>    # Create and apply migration
npx prisma migrate reset                           # Reset database (dev only)
npx prisma studio                                  # Database browser UI
npx prisma generate                                # Regenerate Prisma client
```

### Testing
No test framework currently configured. To add testing:
1. Install preferred framework (Jest, Vitest, etc.)
2. Add test script to package.json
3. Configure test files in `__tests__/` or `*.test.ts` pattern

## Project Architecture

**Stack**: Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 4 + Prisma (PostgreSQL) + NextAuth.js v5

**Key Services**:
- Frontend: Next.js with SSR for API routes, SSG for public pages
- Database: PostgreSQL via Prisma ORM
- Authentication: NextAuth.js v5 credentials provider with Upstash Redis sessions
- Styling: Tailwind CSS 4 with custom brand colors
- External: Acuity Scheduling, Mailgun emails

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