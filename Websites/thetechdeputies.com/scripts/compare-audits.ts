/**
 * @file compare-audits.ts
 * @description Compare two contrast audit reports
 * Usage: npx tsx scripts/compare-audits.ts <before.json> <after.json>
 */

import fs from 'fs';
import path from 'path';

interface AuditReport {
  timestamp: string;
  version: string;
  authState?: string;
  totalPages: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  pages: {
    [key: string]: {
      passed: number;
      failed: number;
      issues: string[];
    };
  };
  colorPalette: {
    [key: string]: string;
  };
}

function loadAudit(filePath: string): AuditReport {
  const content = fs.readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

function compareAudits(before: AuditReport, after: AuditReport): void {
  console.log('\n📊 CONTRAST AUDIT COMPARISON REPORT\n');
  console.log('='.repeat(70));

  // Overall comparison
  console.log('\n📈 OVERALL RESULTS\n');
  console.log('-'.repeat(70));
  console.log(`Metric                         | Before     | After      | Change`);
  console.log('-'.repeat(70));

  const passRateBefore = Math.round((before.passedTests / before.totalTests) * 100);
  const passRateAfter = Math.round((after.passedTests / after.totalTests) * 100);
  const passRateChange = passRateAfter - passRateBefore;

  console.log(`Pass Rate                      | ${passRateBefore}%          | ${passRateAfter}%          | ${passRateChange > 0 ? '+' : ''}${passRateChange}%`);
  console.log(`Passed Tests                   | ${before.passedTests}/${before.totalTests}         | ${after.passedTests}/${after.totalTests}         | ${after.passedTests - before.passedTests > 0 ? '+' : ''}${after.passedTests - before.passedTests}`);
  console.log(`Failed Tests                   | ${before.failedTests}/${before.totalTests}         | ${after.failedTests}/${after.totalTests}         | ${after.failedTests - before.failedTests > 0 ? '+' : ''}${after.failedTests - before.failedTests}`);

  // Page comparison
  console.log('\n\n📄 PAGE COMPLIANCE COMPARISON\n');
  console.log('-'.repeat(70));

  const allPages = new Set([...Object.keys(before.pages), ...Object.keys(after.pages)]);
  allPages.forEach((page) => {
    const beforePage = before.pages[page];
    const afterPage = after.pages[page];

    if (!beforePage || !afterPage) return;

    const beforeRate = beforePage.passed + beforePage.failed > 0
      ? Math.round((beforePage.passed / (beforePage.passed + beforePage.failed)) * 100)
      : 100;
    const afterRate = afterPage.passed + afterPage.failed > 0
      ? Math.round((afterPage.passed / (afterPage.passed + afterPage.failed)) * 100)
      : 100;

    const icon = beforeRate === afterRate ? '=' : afterRate > beforeRate ? '⬆️' : '⬇️';
    console.log(`${icon} ${page.padEnd(40)} ${beforeRate}% → ${afterRate}%`);

    if (afterPage.issues.length > 0 && beforePage.issues.length === 0) {
      console.log(`   ⚠️  NEW ISSUES: ${afterPage.issues.join(', ')}`);
    } else if (afterPage.issues.length > beforePage.issues.length) {
      console.log(`   ⚠️  MORE ISSUES: ${afterPage.issues.length - beforePage.issues.length} additional`);
    } else if (afterPage.issues.length < beforePage.issues.length) {
      console.log(`   ✅ FIXED: ${beforePage.issues.length - afterPage.issues.length} issues`);
    }
  });

  // Color palette comparison
  console.log('\n\n🎨 COLOR PALETTE COMPARISON\n');
  console.log('-'.repeat(70));

  const paletteChanges = Object.keys(before.colorPalette).filter(
    (key) => before.colorPalette[key] !== after.colorPalette[key]
  );

  if (paletteChanges.length === 0) {
    console.log('✅ No color changes detected - palettes are identical');
  } else {
    console.log('⚠️  Color changes detected:\n');
    paletteChanges.forEach((key) => {
      console.log(`   ${key}`);
      console.log(`   Before: ${before.colorPalette[key]}`);
      console.log(`   After:  ${after.colorPalette[key]}\n`);
    });
  }

  // Summary
  console.log('='.repeat(70));
  console.log('\n✨ SUMMARY\n');

  if (passRateAfter === passRateBefore && paletteChanges.length === 0) {
    console.log('✅ No changes detected - audit results are identical');
  } else if (passRateAfter > passRateBefore) {
    console.log(`✅ Improvement detected! Pass rate increased from ${passRateBefore}% to ${passRateAfter}%`);
  } else if (passRateAfter < passRateBefore) {
    console.log(`❌ Regression detected! Pass rate decreased from ${passRateBefore}% to ${passRateAfter}%`);
  } else {
    console.log('⚠️  No pass rate change, but palette may have been updated');
  }

  console.log('\n' + '='.repeat(70) + '\n');
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  // Find latest audits
  const auditDir = path.join(process.cwd(), 'audit-results');
  const files = fs.readdirSync(auditDir).filter((f) => f.endsWith('.json'));
  
  if (files.length < 2) {
    console.log('❌ Need at least 2 audit JSON files to compare');
    console.log('Usage: npx tsx scripts/compare-audits.ts <before.json> <after.json>');
    console.log(`Or place 2+ audit files in ${auditDir}`);
    process.exit(1);
  }

  const sorted = files.sort().reverse();
  const firstFile = path.join(auditDir, sorted[1]);
  const secondFile = path.join(auditDir, sorted[0]);

  console.log(`\nComparing:\n  - ${sorted[1]}\n  - ${sorted[0]}\n`);

  const before = loadAudit(firstFile);
  const after = loadAudit(secondFile);
  compareAudits(before, after);
} else if (args.length === 2) {
  const beforeFile = args[0];
  const afterFile = args[1];

  if (!fs.existsSync(beforeFile) || !fs.existsSync(afterFile)) {
    console.log('❌ One or both files not found');
    process.exit(1);
  }

  const before = loadAudit(beforeFile);
  const after = loadAudit(afterFile);
  compareAudits(before, after);
} else {
  console.log('Usage: npx tsx scripts/compare-audits.ts [before.json] [after.json]');
  console.log('\nIf no files specified, compares the 2 most recent audits');
}
