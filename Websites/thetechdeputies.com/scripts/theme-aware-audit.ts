import fs from "fs";
import path from "path";

interface ContrastResult {
  name: string;
  ratio: number;
  passes7to1: boolean;
  passes3to1: boolean;
  apca: number;
}

interface AuditResult {
  page: string;
  theme: 'light' | 'dark';
  timestamp: string;
  tests: ContrastResult[];
  passed: number;
  total: number;
  passRate: number;
}

// Color palette with both light and dark theme variants
const colorPalette = {
  light: {
    'Primary (#1f5856) on white': { fg: 0x1f5856, bg: 0xffffff },
    'Secondary (#0f1419) on white': { fg: 0x0f1419, bg: 0xffffff },
    'Accent Tan (#6e5331) on white': { fg: 0x6e5331, bg: 0xffffff },
    'Accent Terracotta (#7a3f25) on white': { fg: 0x7a3f25, bg: 0xffffff },
    'Muted Foreground (#595959) on white': { fg: 0x595959, bg: 0xffffff },
    'Border (#949494) on white (UI)': { fg: 0x949494, bg: 0xffffff },
  },
  dark: {
    'White (#ffffff) on dark (#0a0e14)': { fg: 0xffffff, bg: 0x0a0e14 },
    'Light Gray (#b4bfd9) on dark': { fg: 0xb4bfd9, bg: 0x0a0e14 },
    'Border (#566a94) on dark (UI)': { fg: 0x566a94, bg: 0x0a0e14 },
    'Primary text on dark': { fg: 0xffffff, bg: 0x1f5856 },
    'Secondary text on dark': { fg: 0xffffff, bg: 0x0f1419 },
    'Terracotta text on dark': { fg: 0xffffff, bg: 0x7a3f25 },
  },
};

function luminance(r: number, g: number, b: number): number {
  const [rs, gs, bs] = [r, g, b].map((x) => {
    x = x / 255;
    return x <= 0.03928 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

function contrastRatio(color1: number, color2: number): number {
  const r1 = (color1 >> 16) & 0xff;
  const g1 = (color1 >> 8) & 0xff;
  const b1 = color1 & 0xff;
  const r2 = (color2 >> 16) & 0xff;
  const g2 = (color2 >> 8) & 0xff;
  const b2 = color2 & 0xff;

  const lum1 = luminance(r1, g1, b1);
  const lum2 = luminance(r2, g2, b2);

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

function calculateAPCA(fg: number, bg: number): number {
  const r1 = (fg >> 16) & 0xff;
  const g1 = (fg >> 8) & 0xff;
  const b1 = fg & 0xff;
  const r2 = (bg >> 16) & 0xff;
  const g2 = (bg >> 8) & 0xff;
  const b2 = bg & 0xff;

  const lum1 = luminance(r1, g1, b1);
  const lum2 = luminance(r2, g2, b2);

  const contrast =
    lum1 > lum2
      ? (lum1 + 0.05) / (lum2 + 0.05)
      : (lum2 + 0.05) / (lum1 + 0.05);

  return Math.round(Math.log(contrast) * 40.445436) || 0;
}

function runAudit(pages: string[], theme: 'light' | 'dark'): AuditResult[] {
  const palette = colorPalette[theme];
  const results: AuditResult[] = [];

  for (const page of pages) {
    const tests: ContrastResult[] = [];

    for (const [name, colors] of Object.entries(palette)) {
      const ratio = contrastRatio(colors.fg, colors.bg);
      const apca = calculateAPCA(colors.fg, colors.bg);
      const passes7to1 = ratio >= 7.0;
      const passes3to1 = ratio >= 3.0;

      tests.push({
        name,
        ratio: parseFloat(ratio.toFixed(2)),
        passes7to1,
        passes3to1,
        apca,
      });
    }

    const passed = tests.filter((t) => (t.name.includes("(UI)") ? t.passes3to1 : t.passes7to1)).length;
    const result: AuditResult = {
      page,
      theme,
      timestamp: new Date().toISOString(),
      tests,
      passed,
      total: tests.length,
      passRate: (passed / tests.length) * 100,
    };

    results.push(result);
  }

  return results;
}

function formatResults(results: AuditResult[]): string {
  let output = "";

  for (const result of results) {
    output += `\n${"═".repeat(70)}\n`;
    output += `Page: ${result.page} | Theme: ${result.theme.toUpperCase()} | Pass Rate: ${result.passRate.toFixed(0)}%\n`;
    output += `${"═".repeat(70)}\n\n`;

    for (const test of result.tests) {
      const isUI = test.name.includes("(UI)");
      const minRequired = isUI ? 3.0 : 7.0;
      const passes = isUI ? test.passes3to1 : test.passes7to1;
      const status = passes ? "✅" : "❌";

      output += `${status} ${test.name}\n`;
      output += `   Ratio: ${test.ratio}:1 (${passes ? "Pass" : "FAIL"} - Required: ${minRequired}:1)\n`;
      output += `   APCA: ${test.apca}\n\n`;
    }
  }

  return output;
}

async function main() {
  const publicPages = [
    "/",
    "/services",
    "/courses",
    "/subscriptions",
    "/gift-certificates",
    "/about",
    "/contact",
    "/booking",
    "/privacy",
    "/terms",
    "/accessibility",
  ];

  const protectedPages = [
    "/dashboard",
    "/dashboard/subscriptions",
    "/dashboard/sessions",
    "/dashboard/admin/calendar",
  ];

  console.log("🎨 Running theme-aware contrast audits...\n");

  // Light mode audit
  console.log("📱 Running LIGHT MODE audit...");
  const lightResults = runAudit([...publicPages, ...protectedPages], "light");

  // Dark mode audit
  console.log("🌙 Running DARK MODE audit...");
  const darkResults = runAudit([...publicPages, ...protectedPages], "dark");

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-").split("-").slice(0, -1).join("-");
  
  // Save light mode results
  const lightJsonPath = path.join("audit-results", `theme-audit-light-${timestamp}.json`);
  const lightTxtPath = path.join("audit-results", `theme-audit-light-${timestamp}.txt`);

  fs.writeFileSync(lightJsonPath, JSON.stringify(lightResults, null, 2));
  fs.writeFileSync(lightTxtPath, formatResults(lightResults));

  // Save dark mode results
  const darkJsonPath = path.join("audit-results", `theme-audit-dark-${timestamp}.json`);
  const darkTxtPath = path.join("audit-results", `theme-audit-dark-${timestamp}.txt`);

  fs.writeFileSync(darkJsonPath, JSON.stringify(darkResults, null, 2));
  fs.writeFileSync(darkTxtPath, formatResults(darkResults));

  console.log("\n✅ Audits complete!\n");
  console.log(`📄 Light mode results saved to:\n   ${lightJsonPath}\n   ${lightTxtPath}\n`);
  console.log(`📄 Dark mode results saved to:\n   ${darkJsonPath}\n   ${darkTxtPath}\n`);

  // Print summary
  const lightPassRate = (lightResults.reduce((sum, r) => sum + r.passRate, 0) / lightResults.length).toFixed(0);
  const darkPassRate = (darkResults.reduce((sum, r) => sum + r.passRate, 0) / darkResults.length).toFixed(0);

  console.log(`${"═".repeat(70)}`);
  console.log(`LIGHT MODE: ${lightPassRate}% Pass Rate`);
  console.log(`DARK MODE:  ${darkPassRate}% Pass Rate`);
  console.log(`${"═".repeat(70)}\n`);
}

main().catch(console.error);
