# The Tech Deputies Website

A dynamic tech education and support platform built with Next.js, featuring Acuity Scheduling integration for bookings, subscriptions, and gift certificates.

## 📋 Quick Start

This folder is completely self-contained and portable. To run the website:

```bash
bun install
bun run dev
```

The website will be available at `http://localhost:3000`

**Or from the monorepo root:**
```bash
bun install
bun run dev:website
```

## 📦 Project Structure

```
.
├── src/                          # Application source code
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/               # Authentication pages
│   │   ├── api/                  # API endpoints
│   │   ├── dashboard/            # User dashboard
│   │   ├── courses/              # Course pages
│   │   └── [pages]/              # Public pages
│   ├── components/               # React components (atomic design)
│   ├── contexts/                 # React contexts
│   ├── lib/                      # Shared utilities & libraries
│   └── test/                     # Test files
├── prisma/                       # Database schema & migrations
├── public/                       # Static assets
├── scripts/                      # Utility scripts
├── package.json                  # Dependencies
├── next.config.ts                # Next.js configuration
├── tsconfig.json                 # TypeScript configuration
└── [config files]                # ESLint, PostCSS, etc.
```

## 🛠️ Available Scripts

```bash
bun run dev              # Start development server (http://localhost:3000)
bun run build            # Production build
bun start                # Run production server
bun run lint             # ESLint code quality checks
bun run test             # Run tests
bun run test:ui          # Run tests with UI
bun run test:coverage    # Run tests with coverage report
```

## 📚 Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 16+ | React framework with SSR |
| UI | React 19 | UI library |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Language | TypeScript | Type safety |
| Database | PostgreSQL/Prisma | Data persistence |
| Auth | NextAuth.js v5 | Authentication with Redis sessions |
| Email | Mailgun | Transactional emails |
| Scheduling | Acuity Scheduling | Bookings & subscriptions |
| Hosting | Vercel | Serverless deployment |

## 🔧 Environment Setup

1. Copy environment file:
   ```bash
   cp .env.local.example .env.local
   ```

2. Set required environment variables:
   - `DATABASE_URL` - PostgreSQL connection string
   - `REDIS_URL` - Upstash Redis URL (for sessions)
   - `NEXTAUTH_SECRET` - Random secret for NextAuth
   - `MAILGUN_API_KEY` - Mailgun API key
   - `ACUITY_SCHEDULING_KEY` - Acuity Scheduling API key

3. Initialize database:
   ```bash
   bun prisma migrate dev
   ```

## 📖 Documentation

For development guidelines, deployment procedures, and troubleshooting, see the Planning folder:

- **[HANDBOOK.md](../Planning/HANDBOOK.md)** - Deployment & maintenance
- **[AGENTS.md](../Planning/AGENTS.md)** - Development guidelines
- **[WEBSITE_SOURCE_POLICY.md](../Planning/WEBSITE_SOURCE_POLICY.md)** - Source code policy

## 🚀 Deployment

The website is automatically deployed via Vercel on git push to the main branch.

For production deployment details, see [HANDBOOK.md](../Planning/HANDBOOK.md)

## 🔐 Source Code Policy

⚠️ **IMPORTANT**: The `/src` directory is strictly for website code only. No internal tools or unrelated projects should be added here.

See [WEBSITE_SOURCE_POLICY.md](../Planning/WEBSITE_SOURCE_POLICY.md) for guidelines.

## 📝 Development Workflow

1. Create feature branch: `git checkout -b feature/feature-name`
2. Make changes in `/src`
3. Run tests: `npm run test`
4. Run linter: `npm run lint`
5. Commit: `git add . && git commit -m "message"`
6. Push: `git push origin feature/feature-name`
7. Create Pull Request

## 🐛 Troubleshooting

Common issues and solutions can be found in [HANDBOOK.md](../Planning/HANDBOOK.md#troubleshooting-guide)

## 📞 Support

For issues or questions:
1. Check [HANDBOOK.md](../Planning/HANDBOOK.md)
2. Review [AGENTS.md](../Planning/AGENTS.md)
3. Check project tickets in [PROJECT_TICKETS.md](../Planning/PROJECT_TICKETS.md)

---

**Website Version**: 1.0  
**Last Updated**: January 25, 2026  
**Status**: Active Development
