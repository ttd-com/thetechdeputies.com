# Quick Reference Guide

**New Project Structure** - January 25, 2026

## 🚀 Quick Start (Choose Your Path)

### I want to develop the website
```bash
bun install
bun run dev:website
```
→ Website runs at http://localhost:3000

### I want to read operations/deployment info
→ Open [Planning/HANDBOOK.md](Planning/HANDBOOK.md)

### I want to see development guidelines
→ Open [Planning/AGENTS.md](Planning/AGENTS.md)

### I want to see current tasks/tickets
→ Open [Planning/PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md)

### I want to move website to another machine
```bash
cp -r Websites/thetechdeputies.com /destination/path/
cd /destination/path/thetechdeputies.com
bun install
bun run dev
```
Done! Website is running on new machine.

## 📁 Folder Guide

| Folder | Purpose | Who Uses It |
|--------|---------|------------|
| **Websites/thetechdeputies.com/** | The actual website | Developers, DevOps, Deployment |
| **Planning/** | Docs, tasks, config, CI/CD | Developers, Project Managers, Ops |
| **Root (.gitignore, README.md)** | Monorepo config | Everyone (start with README.md) |

## 📚 Where to Find Things

| Question | Answer |
|----------|--------|
| How do I start the website? | `cd Websites/thetechdeputies.com && npm run dev` |
| Where's the source code? | `Websites/thetechdeputies.com/src/` |
| Where's the database schema? | `Websites/thetechdeputies.com/prisma/` |
| How do I deploy? | [Planning/HANDBOOK.md](Planning/HANDBOOK.md#deployment-workflow) |
| What are the project tasks? | [Planning/PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md) |
| What's the code policy? | [Planning/WEBSITE_SOURCE_POLICY.md](Planning/WEBSITE_SOURCE_POLICY.md) |
| Where are GitHub workflows? | [Planning/.github/](Planning/.github/) |
| How do I create a new feature? | [Planning/AGENTS.md](Planning/AGENTS.md#development-workflow) |
| What's the tech stack? | See README.md or [Planning/HANDBOOK.md](Planning/HANDBOOK.md#architecture-overview) |

## 🎯 Common Tasks

### Setup local development
```bash
bun install
bun run dev:website
```

### Build for production
```bash
bun run build
bun run start
```

### Run tests
```bash
bun run test
```

### Check code quality
```bash
bun run lint
```

### View database
```bash
cd Websites/thetechdeputies.com
bun prisma studio
```

## 🔍 File Organization Examples

**Website source code** → `Websites/thetechdeputies.com/src/`
```
src/
├── app/           # Pages & API routes
├── components/    # React components
├── contexts/      # React contexts
├── lib/           # Utilities & helpers
└── test/          # Tests
```

**Development documentation** → `Planning/`
```
Planning/
├── HANDBOOK.md                  # Operations
├── AGENTS.md                    # Development guidelines
├── WEBSITE_SOURCE_POLICY.md     # Code policy
├── PROJECT_TICKETS.md           # Tasks
├── .github/                     # CI/CD workflows
└── [other docs]
```

## ⚡ Pro Tips

1. **Always start in `Websites/thetechdeputies.com/`** when working on code
2. **Check `Planning/` first** when looking for documentation
3. **The website folder is portable** - it can run standalone anywhere
4. **Read the root README.md first** if you're new to the project
5. **Check planning docs** before writing code to understand existing architecture

## 🐛 Troubleshooting

**Website won't start?**
→ Check [Planning/HANDBOOK.md#troubleshooting](Planning/HANDBOOK.md#troubleshooting-guide)

**Import errors?**
→ Make sure you're in `Websites/thetechdeputies.com/` and ran `npm install`

**Database issues?**
→ Run `npx prisma migrate dev` in website folder

**Need environment setup?**
→ Copy `.env.example` to `.env.local` and fill in values

## 📞 Need Help?

1. Check [README.md](README.md) - project overview
2. Check [Planning/HANDBOOK.md](Planning/HANDBOOK.md) - operations guide
3. Check [Planning/AGENTS.md](Planning/AGENTS.md) - development guidelines
4. Check [Planning/PROJECT_TICKETS.md](Planning/PROJECT_TICKETS.md) - current tasks

---

**Last Updated**: January 25, 2026  
**Version**: 1.0
