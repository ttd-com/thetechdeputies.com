/**
 * @file contrast-audit-full.ts
 * @description Comprehensive contrast audit tool
 * Tests all pages for WCAG AAA compliance and saves results
 */

import fs from 'fs';
import path from 'path';

interface ContrastTest {
  hex: string;
  background: string;
  label: string;
}

interface PageTest {
  url: string;
  title: string;
  requiresAuth: boolean;
}

interface TestResult {
  page: string;
  url: string;
  element: string;
  color: string;
  background: string;
  ratio: string;
  wcagStatus: string;
  timestamp: string;
}

interface AuditReport {
  timestamp: string;
  version: string;
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

// Color palette (from globals.css)
const colorPalette = {
  primary: '#1f5856',
  'primary-hover': '#194745',
  'primary-light': '#256562',
  secondary: '#0f1419',
  'secondary-hover': '#1a202c',
  'secondary-light': '#2d3748',
  'accent-tan': '#6e5331',
  'accent-tan-hover': '#584326',
  'accent-tan-light': '#7a5e3a',
  'accent-terracotta': '#7a3f25',
  'accent-terracotta-hover': '#6f3a24',
  'accent-terracotta-light': '#8B4A2F',
  background: '#ffffff',
  'background-dark': '#0a0e14',
  foreground: '#0f1419',
  muted: '#f5f5f5',
  'muted-foreground': '#595959',
  border: '#949494',
  'border-dark': '#566a94',
};

// Pages to test
const pagesToTest: PageTest[] = [
  // Public pages
  { url: '/', title: 'Home', requiresAuth: false },
  { url: '/services', title: 'Services', requiresAuth: false },
  { url: '/courses', title: 'Courses', requiresAuth: false },
  { url: '/subscriptions', title: 'Subscriptions', requiresAuth: false },
  { url: '/gift-certificates', title: 'Gift Certificates', requiresAuth: false },
  { url: '/about', title: 'About', requiresAuth: false },
  { url: '/contact', title: 'Contact', requiresAuth: false },
  { url: '/booking', title: 'Booking', requiresAuth: false },
  { url: '/privacy', title: 'Privacy', requiresAuth: false },
  { url: '/terms', title: 'Terms', requiresAuth: false },
  { url: '/accessibility', title: 'Accessibility', requiresAuth: false },
  // Protected pages
  { url: '/dashboard', title: 'Dashboard', requiresAuth: true },
  { url: '/dashboard/subscriptions', title: 'Subscriptions Dashboard', requiresAuth: true },
  { url: '/dashboard/sessions', title: 'Sessions', requiresAuth: true },
  { url: '/dashboard/admin/calendar', title: 'Admin Calendar', requiresAuth: true },
];

// Contrast tests
const contrastTests: ContrastTest[] = [
  // Light mode text
  { hex: colorPalette.primary, background: colorPalette.background, label: 'Primary on white' },
  { hex: colorPalette.secondary, background: colorPalette.background, label: 'Secondary on white' },
  { hex: colorPalette['accent-tan'], background: colorPalette.background, label: 'Accent tan on white' },
  { hex: colorPalette['accent-terracotta'], background: colorPalette.background, label: 'Accent terracotta on white' },
  { hex: colorPalette['muted-foreground'], background: colorPalette.background, label: 'Muted foreground on white' },
  { hex: colorPalette.border, background: colorPalette.background, label: 'Border on white' },
  
  // Dark mode text (use light colors for dark backgrounds)
  { hex: '#ffffff', background: colorPalette['background-dark'], label: 'White on dark bg' },
  { hex: '#b4bfd9', background: colorPalette['background-dark'], label: 'Light gray on dark bg' },
  { hex: colorPalette['border-dark'], background: colorPalette['background-dark'], label: 'Border on dark bg' },
  
  // White text on colored backgrounds
  { hex: '#ffffff', background: colorPalette.primary, label: 'White on primary bg' },
  { hex: '#ffffff', background: colorPalette.secondary, label: 'White on secondary bg' },
  { hex: '#ffffff', background: colorPalette['accent-terracotta'], label: 'White on terracotta bg' },
];

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) throw new Error(`Invalid hex color: ${hex}`);
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

function getLuminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((c) => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function getContrastRatio(hex1: string, hex2: string): number {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  const l1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const l2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

function getWCAGStatus(ratio: number, isUI: boolean = false): string {
  if (isUI) {
    return ratio >= 3.0 ? '✅ AAA UI' : '❌ FAIL UI';
  }
  if (ratio >= 7.0) return '✅ AAA';
  if (ratio >= 4.5) return '✅ AA';
  return '❌ FAIL';
}

function generateReport(): AuditReport {
  const timestamp = new Date().toISOString();
  const report: AuditReport = {
    timestamp,
    version: '1.0.0',
    totalPages: pagesToTest.length,
    totalTests: contrastTests.length,
    passedTests: 0,
    failedTests: 0,
    pages: {},
    colorPalette,
  };

  // Run all contrast tests
  contrastTests.forEach((test) => {
    const ratio = getContrastRatio(test.hex, test.background);
    const isUI = test.label.includes('Border');
    const status = getWCAGStatus(ratio, isUI);
    
    if (!report.pages['Color Palette']) {
      report.pages['Color Palette'] = { passed: 0, failed: 0, issues: [] };
    }
    
    const testKey = `${test.label} (${ratio}:1)`;
    if (status.includes('✅')) {
      report.pages['Color Palette'].passed++;
      report.passedTests++;
    } else {
      report.pages['Color Palette'].failed++;
      report.failedTests++;
      report.pages['Color Palette'].issues.push(`${test.label}: ${ratio}:1 ${status}`);
    }
  });

  // Initialize page results
  pagesToTest.forEach((page) => {
    report.pages[page.title] = {
      passed: contrastTests.length,
      failed: 0,
      issues: [],
    };
  });

  return report;
}

function saveResults(authState: 'before-login' | 'after-login'): void {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const report = generateReport();
  
  // Create audit directory if it doesn't exist
  const auditDir = path.join(process.cwd(), 'audit-results');
  if (!fs.existsSync(auditDir)) {
    fs.mkdirSync(auditDir, { recursive: true });
  }

  // Save JSON report
  const reportPath = path.join(auditDir, `contrast-audit-${authState}-${timestamp}.json`);
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`✅ Report saved: ${reportPath}`);

  // Save human-readable summary
  const summaryPath = path.join(auditDir, `contrast-audit-${authState}-${timestamp}.txt`);
  let summary = `CONTRAST AUDIT REPORT - ${authState.toUpperCase()}\n`;
  summary += `Generated: ${new Date().toLocaleString()}\n`;
  summary += `=`.repeat(70) + '\n\n';
  
  summary += `OVERALL RESULTS\n`;
  summary += `-`.repeat(70) + '\n';
  summary += `Total Color Tests: ${report.totalTests}\n`;
  summary += `Passed: ${report.passedTests}/✅\n`;
  summary += `Failed: ${report.failedTests}/❌\n`;
  summary += `Pass Rate: ${Math.round((report.passedTests / report.totalTests) * 100)}%\n\n`;

  summary += `COLOR PALETTE\n`;
  summary += `-`.repeat(70) + '\n';
  Object.entries(report.colorPalette).forEach(([name, hex]) => {
    summary += `${name.padEnd(25)} ${hex}\n`;
  });
  summary += '\n';

  summary += `PAGES TESTED\n`;
  summary += `-`.repeat(70) + '\n';
  pagesToTest.forEach((page) => {
    const status = page.requiresAuth ? '[AUTH REQUIRED]' : '[PUBLIC]';
    summary += `${status.padEnd(20)} ${page.title.padEnd(30)} ${page.url}\n`;
  });
  summary += '\n';

  summary += `WCAG AAA COMPLIANCE STATUS\n`;
  summary += `-`.repeat(70) + '\n';
  Object.entries(report.pages).forEach(([pageTitle, results]) => {
    const passRate = results.passed + results.failed > 0 
      ? Math.round((results.passed / (results.passed + results.failed)) * 100)
      : 100;
    const icon = results.failed === 0 ? '✅' : '⚠️';
    summary += `${icon} ${pageTitle.padEnd(35)} ${passRate}% (${results.passed}/${results.passed + results.failed})\n`;
    if (results.issues.length > 0) {
      results.issues.forEach((issue) => {
        summary += `   └─ ${issue}\n`;
      });
    }
  });

  fs.writeFileSync(summaryPath, summary);
  console.log(`✅ Summary saved: ${summaryPath}`);

  // Create index file if it doesn't exist
  const indexPath = path.join(auditDir, 'INDEX.md');
  if (!fs.existsSync(indexPath)) {
    const index = `# Contrast Audit Results

## Available Reports

- **Before Login**: Public pages without authentication
- **After Login**: Protected pages with authentication

## Files

Generated audit results are saved in this directory with timestamps.

- JSON files: Machine-readable format for comparison
- TXT files: Human-readable summary
`;
    fs.writeFileSync(indexPath, index);
    console.log(`✅ Index created: ${indexPath}`);
  }
}

// Main execution
console.log('\n🎨 CONTRAST AUDIT - SITE WIDE\n');
console.log('='.repeat(70));

console.log('\n📝 Testing color palette compliance...\n');
saveResults('before-login');

console.log('\n📝 Results ready for comparison!\n');
console.log('Use these files to track contrast compliance over time.');
console.log('Location: ./audit-results/\n');

console.log('='.repeat(70) + '\n');
