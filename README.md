# The Tech Deputies - Company Monorepo

This is the root monorepo for The Tech Deputies company organization.

## 📁 Folder Structure

```
thetechdeputies-monorepo/
├── Websites/                          # Production websites (auto-discovered)
│   └── thetechdeputies.com/          # Main website (standalone, portable)
│       ├── src/                      # React/Next.js source
│       ├── prisma/                   # Database schema & migrations
│       ├── public/                   # Static assets
│       ├── scripts/                  # Utility scripts
│       ├── package.json              # Dependencies
│       ├── next.config.ts            # Next.js configuration
│       └── [all website config]      # All website-specific files
│
├── Scripts/                           # Workspace management scripts
│   └── run-workspace.js              # Dynamic project discovery & runner
│
├── Planning/                          # Development & planning resources
│   ├── HANDBOOK.md                   # Deployment & maintenance procedures
│   ├── AGENTS.md                     # AI agent instructions
│   ├── WEBSITE_SOURCE_POLICY.md      # Website source code policy
│   ├── PROJECT_TICKETS.md            # Project tasks & tickets
│   ├── CHANGELOG.md                  # Version history
│   ├── brainstorming-session.md      # Session notes
│   ├── .github/                      # GitHub workflows & CI/CD
│   ├── .vscode/                      # VS Code settings
│   └── [documentation & configs]     # Planning resources
│
└── [root config files]
    ├── package.json                  # Root workspace config
    ├── .git/                         # Git repository
    ├── .gitignore                    # Global ignore rules
    └── README.md                     # This file
```

## 🚀 Getting Started

### Workspace Management with Dynamic Discovery

This project uses a **dynamic workspace system** to manage multiple website projects in `/Websites/`.

**First time setup:**
```bash
bun install
```

**Run the website from project root:**
```bash
bun workspace thetechdeputies.com dev
```

**Or use the shorthand:**
```bash
bun dev                    # Starts thetechdeputies.com in dev mode
bun run dev:website        # Alternative shorthand
```

**List all available projects:**
```bash
bun workspace --help
```

**Production build:**
```bash
bun build
```

The website will be available at `http://localhost:3000`

### Alternative: Work Directly in Website Folder

The website is completely self-contained and portable. To work directly in the website folder:

```bash
cd Websites/thetechdeputies.com
bun install
bun run dev
```

### Documentation

All development, planning, and operational documentation is in the `/Planning` folder:

- **[HANDBOOK.md](Planning/HANDBOOK.md)** - Deployment, maintenance, troubleshooting
- **[AGENTS.md](Planning/AGENTS.md)** - Instructions for AI agents working in this codebase
- **[WEBSITE_SOURCE_POLICY.md](Planning/WEBSITE_SOURCE_POLICY.md)** - Guidelines for website source code
- **[PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md)** - Current tasks and tickets

## 📦 Website Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.1.3 |
| UI Library | React | 19.2.3 |
| Styling | Tailwind CSS | 4.x |
| Language | TypeScript | Latest |
| Database | PostgreSQL (Prisma) | 7.2.0 |
| Authentication | NextAuth.js | 5.x |
| Session Store | Upstash Redis | - |
| Email Service | Mailgun | - |
| Hosting | Vercel | - |

## 🔄 CI/CD & Deployment

GitHub Actions workflows are configured in `/Planning/.github/workflows/`

Deployments are automated via Vercel on git push to main branch.

## 📝 Development Workflow

1. **Planning**: Use `/Planning` folder for notes, discussions, tickets
2. **Development**: Work in `/Websites/thetechdeputies.com/src`
3. **Website Policy**: Follow guidelines in `Planning/WEBSITE_SOURCE_POLICY.md`
4. **Testing**: Run tests within website folder
5. **Deployment**: Push to git, automated deployment via Vercel

## 🔐 Security

- Environment variables for each environment are configured separately
- Production secrets are managed via Vercel environment settings
- Database migrations are tracked in `/Websites/thetechdeputies.com/prisma/migrations/`

## 📞 Support

For documentation on specific systems:
- **Deployment Issues**: See `Planning/HANDBOOK.md`
- **Code Guidelines**: See `Planning/AGENTS.md`
- **Source Code Rules**: See `Planning/WEBSITE_SOURCE_POLICY.md`

---

**Last Updated**: January 26, 2026  
**Monorepo Version**: 1.0


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

## Security Audit (2026-01-24)

- Performed a quick repository security audit and documentation update.
- Findings:
   - Developer secrets were present in the local file `.env.local` (Mailgun API key, `DATABASE_URL`, `REDIS_TOKEN`, `NEXTAUTH_SECRET`). These are development credentials stored locally and must be rotated if they have been shared.
   - Build artifacts (the `.next` directory) contain runtime references but are ignored by `.gitignore` and are not committed.
   - `.gitignore` contains a rule to ignore `.env*` files while allowing `.env.example`; this prevents accidental commits of local env files like `.env.local`.
- Actions taken:
   - Added audit notes to the changelog and a small fix to `src/lib/db.ts` to address a Prisma enum validation error.
   - Recommended next steps: rotate any exposed secrets immediately, add production secrets to a secret manager (Vercel/GitHub/Vault), and consider adding a pre-commit secret-scanning hook.

## Developer Notes — DB Toggle (2026-01-25)

- New environment toggle: `DB_HOST_LOCAL` (true/false).
   - When `DB_HOST_LOCAL=true`, the application prefers `DATABASE_URL_LOCAL` (e.g., a `localhost` Postgres instance).
   - When `DB_HOST_LOCAL=false`, the application prefers `DATABASE_URL_REMOTE` (e.g., production DB connection string).
   - If neither local nor remote variables are set, the application falls back to `DATABASE_URL` for compatibility.

- Files updated to support this behavior:
   - `src/lib/env.ts` (new) — `getDatabaseUrl()` helper
   - `src/lib/db.ts` — runtime DB client uses `getDatabaseUrl()`
   - `prisma/prisma.config.ts` — Prisma CLI reads URL via helper
   - `scripts/seed-dev-user.ts` — seed script uses helper

- Quick example (`.env.local`):

```dotenv
DB_HOST_LOCAL=false
DATABASE_URL_REMOTE=postgres://user:pass@db.prisma.io:5432/postgres?sslmode=verify-full
DATABASE_URL=${DATABASE_URL_REMOTE}
```

Use `DB_HOST_LOCAL=false` in deployed environments and set `DATABASE_URL_REMOTE` (or `DATABASE_URL`) in your host's environment variable settings.

## TypeScript & Build Fixes (2026-01-25)

**Status: ✅ All non-test source files now compile with zero TypeScript errors**

### Changes Made

1. **TypeScript Type Safety** (74 errors fixed)
   - Aligned `EmailJob` status types with `EmailStatus` enum from queue-manager
   - Fixed email service to use consistent `Priority` enum instead of string literals
   - Made Template interface fields optional for flexible initialization

2. **Email System Architecture**
   - Added missing `startProcessing()` method to QueueManager
   - Fixed `validateTemplateData()` to properly iterate over Record types
   - Fixed template rendering with proper error handling and type signatures

3. **User Management Features**
   - Implemented `toggleUserRole()` - toggles user between USER/ADMIN roles via API
   - Implemented `resetUserPassword()` - triggers password reset flow
   - Implemented `bulkUpdateRoles()` - batch update multiple users' roles

4. **Middleware & Connection String**
   - Fixed middleware export from `default` to `named export` (required by Next.js)
   - Updated PostgreSQL connection string to use `sslmode=verify-full` (pg v9.0 compatible)

### Files Modified
- `src/lib/email/webhook-handlers.ts` - Removed duplicate declarations
- `src/lib/email/email-service.ts` - Type alignment and enum usage
- `src/lib/email/queue-manager.ts` - Added missing method
- `src/lib/email/template-engine.ts` - Fixed validation and rendering logic
- `src/contexts/UserManagementContext.tsx` - Implemented missing operations
- `middleware.ts` - Fixed export syntax
- `.env.local` - Updated SSL mode


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
