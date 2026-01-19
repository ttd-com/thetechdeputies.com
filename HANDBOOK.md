# The Tech Deputies - Project Handbook

> **Last Updated**: 2026-01-18
> **Project**: station.thetechdeputies.com (Beta/Staging)
> **Production URL**: https://station.thetechdeputies.com
> **Repository**: GitHub (private)

---

## Executive Summary

This handbook documents the complete deployment, maintenance, and troubleshooting procedures for The Tech Deputies website. It serves as the single source of truth for understanding **what** works, **why** it works, and **how** to maintain it.

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Deployment Environments](#deployment-environments)
3. [Environment Configuration](#environment-configuration)
4. [Deployment Workflow](#deployment-workflow)
5. [Database](#database)
6. [Authentication](#authentication)
7. [Troubleshooting Guide](#troubleshooting-guide)
8. [Legacy Deployment Reference](#legacy-deployment-reference)
9. [Maintenance Procedures](#maintenance-procedures)

---

## Architecture Overview

### Technology Stack

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| Frontend | Next.js | 16.1.3 | React framework with SSR/SSG |
| Styling | TailwindCSS | 4.x | Utility-first CSS |
| Authentication | NextAuth.js | 5.x | Credentials-based auth |
| Database | PostgreSQL | via Prisma | User data, sessions, settings |
| Session Store | Upstash Redis | - | Redis-based session caching |
| Email | Mailgun | - | Transactional emails |
| Hosting | Vercel | - | Serverless deployment |

### Application Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth group (login, register, reset)
│   ├── api/               # API routes
│   ├── dashboard/         # Protected dashboard pages
│   └── ...                # Public pages
├── components/            # React components
├── lib/                   # Core libraries
│   ├── db.ts             # Database operations
│   ├── auth.ts           # NextAuth configuration
│   └── logger.ts         # Application logging
└── ...
```

---

## Deployment Environments

### Branch-Based Deployment Strategy

| Branch | Domain | Purpose |
|--------|--------|---------|
| `main` | station.thetechdeputies.com | Beta/Staging - test new features |
| `production` | thetechdeputies.com | Production - stable release (future) |

### Promotion Workflow

```bash
# To promote beta to production:
git checkout production
git merge main
git push
# Vercel auto-deploys to production domain
```

---

## Environment Configuration

### Required Environment Variables

Configure these in your Vercel project settings (Settings > Environment Variables):

| Variable | Purpose | Environments |
|----------|---------|--------------|
| `NEXTAUTH_SECRET` | Session encryption key | All |
| `NEXTAUTH_URL` | Auth callback URL | Production |
| `AUTH_TRUST_HOST` | Trust proxy headers (`true`) | All |
| `DATABASE_URL` | PostgreSQL connection string | All |
| `REDIS_URL` | Upstash Redis URL | All |
| `REDIS_TOKEN` | Upstash auth token | All |
| `MAILGUN_API_KEY` | Email sending API key | All |
| `MAILGUN_DOMAIN` | Email sender domain | All |

### Local Development (.env.local)

```bash
# Copy from .env.example and fill in your values
cp .env.example .env.local

# Required variables:
NEXTAUTH_SECRET=your-generated-secret
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=your-postgres-connection-string
REDIS_URL=your-upstash-url
REDIS_TOKEN=your-upstash-token
MAILGUN_API_KEY=your-mailgun-key
MAILGUN_DOMAIN=your-domain
```

### Generating Secrets

```bash
# Generate a secure NEXTAUTH_SECRET
openssl rand -base64 32
```

---

## Deployment Workflow

### Vercel CI/CD (Current)

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   LOCALHOST     │     │    GitHub       │     │    Vercel       │
│                 │     │                 │     │                 │
│  npm run dev    │────▶│  git push       │────▶│  Auto Deploy    │
│  Test changes   │     │  main branch    │     │  Live site      │
│                 │     │                 │     │                 │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Step-by-Step Deployment

1. **Local Development**
   ```bash
   npm run dev
   # Test at http://localhost:3000
   ```

2. **Commit Changes**
   ```bash
   git add -A
   git commit -m "feat: description of changes"
   ```

3. **Push to GitHub**
   ```bash
   git push origin main
   ```

4. **Vercel Automatically**
   - Detects the push
   - Runs `npm install` and `npm run build`
   - Deploys to staging (station.thetechdeputies.com)

5. **Verify Deployment**
   - Check Vercel dashboard for build status
   - Visit https://station.thetechdeputies.com

---

## Database

### Current: PostgreSQL (via Prisma)

- **Provider**: Neon, Vercel Postgres, or Supabase
- **ORM**: Prisma
- **Schema**: `prisma/schema.prisma`

### Tables

| Table | Purpose |
|-------|---------|
| users | User accounts |
| sessions | Active sessions |
| password_reset_tokens | Password reset flow |
| email_verification_tokens | Email verification |
| rate_limits | API rate limiting |
| settings | Site configuration |
| gift_cards | Gift card management |
| gift_card_transactions | Gift card usage history |
| course_purchases | Course enrollment |

### Running Migrations

```bash
# Generate Prisma client
npx prisma generate

# Push schema changes to database
npx prisma db push

# Run migrations (if using migration files)
npx prisma migrate deploy
```

---

## Authentication

### NextAuth.js Configuration

- **Provider**: Credentials (email/password)
- **Session Strategy**: JWT with Redis backing
- **Auth File**: `src/lib/auth.ts`

### Creating Admin Users

Use the provided script:

```bash
npx ts-node scripts/make-admin.ts
```

---

## Troubleshooting Guide

### Quick Diagnostics

1. **Check Vercel Dashboard**
   - View deployment logs
   - Check function logs for errors

2. **Check Environment Variables**
   - Ensure all required vars are set in Vercel
   - Verify no typos in variable names

3. **Local Testing**
   ```bash
   npm run build
   npm start
   ```

### Common Issues

| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| 500 Internal Server Error | Missing env vars or database error | Check Vercel logs, verify DATABASE_URL |
| Login fails | Auth configuration | Verify NEXTAUTH_SECRET matches across environments |
| Email not sending | Mailgun config | Verify MAILGUN_API_KEY and domain |
| Session issues | Redis connection | Check REDIS_URL and REDIS_TOKEN |

---

## Legacy Deployment Reference

> **Note**: This section documents the previous self-hosted deployment using Forgejo CI/CD.
> It's preserved as a reference for alternative deployment strategies.

A legacy deployment workflow example is available at `.forgejo/workflows/deploy.yaml.example`.
This demonstrates how to deploy to a self-hosted server using:

- **rsync** for file transfer
- **PM2** for process management
- **Caddy** for reverse proxy
- **NVM** for Node.js version management

This can serve as a starting point for deployments to:
- Custom VPS servers
- On-premise infrastructure
- Alternative cloud providers

See the example file for implementation details.

---

## Maintenance Procedures

### Regular Checks

- [ ] Site accessible at production URL
- [ ] No errors in Vercel function logs
- [ ] Database backups are current

### Before Major Changes

1. Test locally first (`npm run dev`)
2. Create a preview deployment (PR to main)
3. Test on preview URL
4. Merge to main for staging
5. Monitor logs after deploy

### Database Backups

Use your database provider's backup features:
- **Neon**: Automatic point-in-time recovery
- **Supabase**: Daily backups
- **Vercel Postgres**: Automatic backups

---

## Golden Path Principles

### From Localhost to Production

1. **Build Once, Deploy Everywhere**: Same code, same build, different configs
2. **Immutable Artifacts**: Don't modify deployed code, redeploy
3. **Git as Source of Truth**: All config in version control
4. **Automated Gates**: Vercel enforces build checks
5. **Progressive Delivery**: Deploy to staging (station) first, then production

### DORA Metrics to Track

| Metric | Target | Current |
|--------|--------|---------|
| Deployment Frequency | Daily | On-demand |
| Change Lead Time | < 1 hour | ~5 min |
| Failed Deployment Recovery | < 1 hour | Automatic rollback |
| Change Failure Rate | < 5% | Tracked in Vercel |

---

## Version History

| Date | Change | Author |
|------|--------|--------|
| 2026-01-18 | Migrated to GitHub + Vercel | - |
| 2026-01-18 | Initial handbook creation | - |

---

*This handbook is a living document. Update it whenever procedures change.*
