# Website Source Code Policy

## Purpose

This document establishes guidelines for keeping the website source code (`/src`) clean, focused, and free from unrelated project artifacts.

## Principle

**The `/src` directory contains ONLY code that runs on the public website.**

### What Belongs in `/src`

✅ **Website application code:**
- React components for pages and UI
- API routes that power the website
- Styling and layout code
- Authentication and authorization for the website
- Database models and migrations specific to the website
- Utilities and helpers used by the website

✅ **Website-specific libraries:**
- Authentication configuration
- Course management
- Payment/gift card processing
- User account management
- Email templates and configuration (for user-facing emails)

### What Does NOT Belong in `/src`

❌ **Development and tooling:**
- BMAD (internal agent/workflow management system)
- Build scripts and configuration utilities
- Test harnesses and testing frameworks
- Analysis tools and generators

❌ **Admin/internal tools:**
- Admin dashboards
- Internal reporting systems
- Developer utilities

❌ **Unrelated projects:**
- Different applications or services
- Legacy migration tooling

## Directory Structure

```
src/
├── app/
│   ├── api/           # Only website API routes (auth, courses, payments, etc.)
│   ├── (auth)/        # Login, register, password reset pages
│   ├── dashboard/     # User dashboard pages
│   ├── courses/       # Course catalog and course pages
│   └── [public pages]/ # About, privacy, contact, etc.
├── components/        # React components (atoms, molecules, organisms)
├── contexts/          # React context providers
├── lib/               # Shared utilities and configuration
│   ├── auth.ts        # Authentication logic
│   ├── auth.config.ts # NextAuth configuration
│   ├── db.ts          # Database operations
│   ├── email.ts       # Email functionality
│   ├── acuity.ts      # Acuity Scheduling integration
│   ├── logger.ts      # Logging utility
│   └── [other utilities]/
└── test/              # Website tests only
```

## Code Review Checklist

Before committing code to `/src`, verify:

- [ ] Code is directly related to the website functionality
- [ ] No experimental or internal tooling is included
- [ ] No unrelated project files are present
- [ ] Imports only reference website libraries (no external tools)
- [ ] No large configuration or state management systems for tooling

## Related Project Locations

- **Multiple Website Projects**: `/Websites/` (each with own package.json)
- **Workspace Management Scripts**: `/Scripts/` (dynamic project runner, workspace utilities)
- **Internal Tools & Workflows**: `/_bmad/` (development configuration only)
- **Admin Dashboard**: `/apps/admin/` (in future monorepo)
- **Shared Libraries**: `/packages/` (in future monorepo)

### Adding New Projects

When adding a new website/project to `/Websites`:

1. Create directory: `Websites/newproject/`
2. Include `package.json` with scripts
3. Run from root: `bun workspace newproject dev`
4. Automatically discovered—no manual registration needed

## Violations & Cleanup

If unrelated code is discovered in `/src`:

1. Create an issue documenting the violation
2. Move code to appropriate location
3. Update imports and references
4. Remove from `/src`
5. Verify website builds and deploys correctly

## Workspace Scripts Location

⚠️ **IMPORTANT**: All workspace management and utility scripts belong in `/Scripts/`, not at the project root or in `/src/`.

**Examples**:
- `Scripts/run-workspace.js` - Dynamic project runner for `/Websites`
- Future scripts for bulk operations, deployment, etc.

This keeps the root directory clean and `/src` exclusively for website code.

---

**Last Updated**: January 26, 2026  
**Status**: Active Policy
