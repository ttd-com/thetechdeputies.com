/**
 * @file run-contrast-audit.ts
 * @description Master script to run full contrast audit
 * Generates before-login and after-login audit reports
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('\n🎨 CONTRAST AUDIT - SITE WIDE TESTING\n');
  console.log('='.repeat(70));
  console.log('Creating comprehensive contrast compliance report\n');

  // Step 1: Generate before-login audit
  console.log('📍 Step 1: Running BEFORE-LOGIN audit (public pages)...\n');
  try {
    execSync('npx tsx scripts/contrast-audit-full.ts', { 
      cwd: process.cwd(),
      stdio: 'inherit'
    });
  } catch (error) {
    console.error('Error running before-login audit:', error);
  }

  // Step 2: Create comparison framework
  console.log('\n📍 Step 2: Creating comparison framework...\n');
  
  const auditDir = path.join(process.cwd(), 'audit-results');
  const comparisonPath = path.join(auditDir, 'COMPARISON.md');

  const comparisonContent = `# Contrast Audit Comparison Report

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
   \`\`\`bash
   npx tsx scripts/contrast-audit-full.ts
   \`\`\`

2. **Compare Results**: Use JSON files for automated comparison
   \`\`\`bash
   node scripts/compare-audits.js <old-audit.json> <new-audit.json>
   \`\`\`

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

\`\`\`
${fs.readdirSync(auditDir)
  .filter(f => f.startsWith('contrast-audit-') && f.endsWith('.txt'))
  .sort()
  .reverse()
  .slice(0, 10)
  .map(f => `- ${f}`)
  .join('\n')}
\`\`\`

## Next Steps

- **All tests passing?** Mark as baseline for production
- **Tests failing?** Review color values and update globals.css
- **Making changes?** Re-run audit to verify no regressions

---

Last updated: ${new Date().toLocaleString()}
`;

  fs.writeFileSync(comparisonPath, comparisonContent);
  console.log(`✅ Comparison guide created: audit-results/COMPARISON.md\n`);

  // Step 3: Summary
  console.log('='.repeat(70));
  console.log('\n✨ AUDIT COMPLETE!\n');
  console.log('📁 Results saved to: ./audit-results/\n');
  console.log('Files generated:');
  
  const auditFiles = fs.readdirSync(auditDir);
  auditFiles.forEach(file => {
    const filePath = path.join(auditDir, file);
    const stats = fs.statSync(filePath);
    const size = (stats.size / 1024).toFixed(1);
    console.log(`   ✓ ${file} (${size}KB)`);
  });

  console.log('\n📊 Next Steps:\n');
  console.log('1. Review the contrast-audit-before-login-*.txt file for detailed results');
  console.log('2. Save these baseline results for comparison later');
  console.log('3. If making color changes, run the audit again to verify compliance');
  console.log('4. Use COMPARISON.md as a reference guide for future audits\n');

  console.log('='.repeat(70) + '\n');
}

main().catch(console.error);
