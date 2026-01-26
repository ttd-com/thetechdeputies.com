# The Tech Deputies - Quick Agent Reference

👉 **For complete agent instructions and development guidelines, see:** [Planning/AGENTS.md](Planning/AGENTS.md)

---

## 🚀 Quick Start

### First Time Setup
1. Read [README.md](README.md) for project overview
2. Read [Planning/AGENTS.md](Planning/AGENTS.md) for detailed guidelines
3. See [Planning/PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md) for current tasks

### Start the Website
```bash
bun install
bun run dev:website
```
→ Website runs at `http://localhost:3000`

### Essential Commands
```bash
bun run build         # Production build
bun run lint          # Code quality check
bun run test          # Run tests
bun run start         # Production server
```

---

## 📚 Project Resources

### In Planning/ Folder
All development, operational, and architectural documentation:

| File | Purpose |
|------|---------|
| **[AGENTS.md](Planning/AGENTS.md)** | Complete agent instructions & guidelines |
| **[HANDBOOK.md](Planning/HANDBOOK.md)** | Deployment, maintenance, troubleshooting |
| **[WEBSITE_SOURCE_POLICY.md](Planning/WEBSITE_SOURCE_POLICY.md)** | Website source code rules |
| **[PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md)** | Current tasks & issues |
| **[CHANGELOG.md](Planning/CHANGELOG.md)** | Version history & changes |
| **[QUICKSTART.md](Planning/QUICKSTART.md)** | Quick reference guide |
| **[.github/](Planning/.github/)** | CI/CD workflows |
| **[.vscode/](Planning/.vscode/)** | IDE configuration |

### Website Structure
```
Websites/thetechdeputies.com/
├── src/
│   ├── app/            # Next.js App Router (pages & API routes)
│   ├── components/     # React components (atomic design)
│   ├── contexts/       # React contexts
│   ├── lib/            # Utilities & helpers
│   └── test/           # Test files
├── prisma/             # Database schema & migrations
├── public/             # Static assets
└── scripts/            # Utility scripts
```

---

## 🎯 Key Guidelines

### Before You Code
1. ✅ Check [Planning/WEBSITE_SOURCE_POLICY.md](Planning/WEBSITE_SOURCE_POLICY.md) - **ONLY website code in /src**
2. ✅ Check [Planning/PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md) - See current priorities
3. ✅ Read [Planning/AGENTS.md](Planning/AGENTS.md) - Full development guidelines

### Development Workflow
1. Check Planning/PROJECT_TICKETS.md for tasks
2. Create feature branch: `git checkout -b feature/name`
3. Code in `Websites/thetechdeputies.com/src/`
4. Follow guidelines in [Planning/AGENTS.md](Planning/AGENTS.md)
5. Run `npm run lint` and `npm run test`
6. Commit and push
7. Create Pull Request

### Code Quality
- **Use TypeScript** - No `any` types
- **Follow naming conventions** - PascalCase for components, camelCase for utils
- **Structure components** - Use atomic design pattern
- **Keep /src clean** - Website code only, follow source policy
- **Write tests** - Use Vitest for unit tests
- **Document changes** - Update CHANGELOG.md

---

## 📋 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 |
| Styling | Tailwind CSS 4 |
| Language | TypeScript |
| Database | PostgreSQL (Prisma) |
| Auth | NextAuth.js v5 |
| Sessions | Upstash Redis |
| Email | Mailgun |
| Scheduling | Acuity Scheduling |
| Hosting | Vercel |

---

## ❓ Where to Find Things

| Question | Answer |
|----------|--------|
| How do I start the website? | `cd Websites/thetechdeputies.com && npm run dev` |
| Where are development guidelines? | [Planning/AGENTS.md](Planning/AGENTS.md) |
| Where are deployment instructions? | [Planning/HANDBOOK.md](Planning/HANDBOOK.md) |
| Where are the current tasks? | [Planning/PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md) |
| Where's the website source code? | `Websites/thetechdeputies.com/src/` |
| Where's the database schema? | `Websites/thetechdeputies.com/prisma/` |
| Where are CI/CD workflows? | [Planning/.github/](Planning/.github/) |
| What about source code policy? | [Planning/WEBSITE_SOURCE_POLICY.md](Planning/WEBSITE_SOURCE_POLICY.md) |
| How do I move the website elsewhere? | Copy `Websites/thetechdeputies.com/` to new location, run `npm install && npm run dev` |

---

## 🔗 Important Links

**Start Here:**
- [README.md](README.md) - Project overview
- [Planning/QUICKSTART.md](Planning/QUICKSTART.md) - Quick commands

**Development:**
- [Planning/AGENTS.md](Planning/AGENTS.md) - Complete guidelines ⭐
- [Planning/WEBSITE_SOURCE_POLICY.md](Planning/WEBSITE_SOURCE_POLICY.md) - Code rules
- [Planning/PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md) - Tasks

**Operations:**
- [Planning/HANDBOOK.md](Planning/HANDBOOK.md) - Deployment & ops
- [Planning/CHANGELOG.md](Planning/CHANGELOG.md) - Version history
- [Planning/.github/](Planning/.github/) - Workflows

---

## 💡 Pro Tips

1. **Always check Planning/ first** when looking for documentation
2. **Website folder is portable** - copy and use anywhere
3. **Keep /src clean** - no experiments, use Planning/ instead
4. **Use @/ import alias** - all paths relative to src/
5. **Follow the style guide** - see [Planning/AGENTS.md](Planning/AGENTS.md)

---

**Need more details?** → Read [Planning/AGENTS.md](Planning/AGENTS.md)

**Project Status**: 🟢 Ready to use | **Last Updated**: January 25, 2026
