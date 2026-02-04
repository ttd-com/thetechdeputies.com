# Contrast Audit Comparison Report

## Purpose
Track contrast compliance changes over time. Compare audits before and after design changes.

## Available Audits

### Before Login
Public pages (no authentication required):
- Home
- Services
- Courses
- Subscriptions
- Gift Certificates
- About
- Contact
- Booking
- Privacy Policy
- Terms of Service
- Accessibility

### After Login
Protected pages (authentication required):
- Dashboard
- Subscriptions Dashboard
- Sessions
- Admin Calendar

## How to Use

1. **Generate Baseline**: Run contrast audit before changes
   ```bash
   npx tsx scripts/contrast-audit-full.ts
   ```

2. **Compare Results**: Use JSON files for automated comparison
   ```bash
   node scripts/compare-audits.js <old-audit.json> <new-audit.json>
   ```

3. **Review Changes**: Check the generated comparison report

## Compliance Standards

- **WCAG 2.1 AAA**: 7:1 ratio for normal text, 3:1 for UI elements
- **APCA**: Lc 75+ for body text (estimated)
- **Light Mode**: Dark text on white backgrounds
- **Dark Mode**: Light text on dark backgrounds

## Color Palette

These colors are tested in all combinations:

### Light Mode (Dark Text)
- Primary: #1f5856 (8.11:1 on white) ✅
- Secondary: #0f1419 (18.51:1 on white) ✅
- Accent Tan: #6e5331 (7.13:1 on white) ✅
- Accent Terracotta: #7a3f25 (8.19:1 on white) ✅
- Muted Foreground: #595959 (7.00:1 on white) ✅
- Border: #949494 (3.03:1 on white) ✅

### Dark Mode (Light Text)
- White: #ffffff (19.34:1 on dark) ✅
- Light Gray: #b4bfd9 (10.49:1 on dark) ✅
- Border: #566a94 (3.58:1 on dark) ✅

### Background Colors
- Light: #ffffff
- Dark: #0a0e14

## Recent Audits

Generated audits are listed below with timestamps:

```
- contrast-audit-before-login-2026-02-03T08-52-17-279Z.txt
- contrast-audit-before-login-2026-02-03T08-51-07-352Z.txt
```

## Next Steps

- **All tests passing?** Mark as baseline for production
- **Tests failing?** Review color values and update globals.css
- **Making changes?** Re-run audit to verify no regressions

---

Last updated: 2/3/2026, 12:52:17 AM
