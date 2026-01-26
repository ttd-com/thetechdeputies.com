#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const websitesDir = path.join(__dirname, '..', 'Websites');
const args = process.argv.slice(2);

// Get list of projects in Websites directory
function getProjects() {
  return fs.readdirSync(websitesDir).filter(file => {
    const fullPath = path.join(websitesDir, file);
    return fs.statSync(fullPath).isDirectory() && 
           fs.existsSync(path.join(fullPath, 'package.json'));
  });
}

function showHelp() {
  const projects = getProjects();
  console.log(`
Usage: bun workspace <project> <command> [args...]

Available Projects:
  ${projects.join('\n  ')}

Commands:
  dev, build, start, test, lint, postinstall, etc.

Examples:
  bun workspace thetechdeputies.com dev
  bun workspace thetechdeputies.com build
  bun workspace thetechdeputies.com test
  bun workspace --help, -h
  `);
}

// Handle help
if (args.length === 0 || args[0] === '--help' || args[0] === '-h') {
  showHelp();
  process.exit(0);
}

const [project, command, ...commandArgs] = args;

// Validate project exists
const projects = getProjects();
if (!projects.includes(project)) {
  console.error(`\n❌ Project "${project}" not found in Websites/\n`);
  console.error(`Available projects: ${projects.join(', ')}\n`);
  process.exit(1);
}

if (!command) {
  console.error(`\n❌ Please specify a command to run\n`);
  showHelp();
  process.exit(1);
}

// Run the command
const projectPath = path.join(websitesDir, project);
const fullCommand = `cd "${projectPath}" && bun run ${command}${commandArgs.length ? ' ' + commandArgs.join(' ') : ''}`;

try {
  console.log(`\n🚀 Running: ${command} in ${project}\n`);
  execSync(fullCommand, { stdio: 'inherit' });
} catch (error) {
  process.exit(error.status || 1);
}
