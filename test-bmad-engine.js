/**
 * Test BMad Engine functionality
 */

// Import just the core functionality we need
const path = require('path');

// Simple test of BMad parser functionality
function testBMadParser() {
  console.log('Testing BMad Parser...');
  
  // Test command parsing
  const testCommands = [
    '/bmad:core:agents:bmad-master',
    '/bmad:bmm:workflows:prd',
    '/bmad:cis:tasks:brainstorming',
    '/bmad:invalid:format'
  ];
  
  // Simple regex test (copied from parser)
  const COMMAND_REGEX = /^\/bmad:(core|bmm|bmb|cis):(workflows|agents|tasks):([^:]+)(?::(.+))?$/;
  
  testCommands.forEach(cmd => {
    const match = cmd.match(COMMAND_REGEX);
    if (match) {
      const [, module, type, name, parameters] = match;
      console.log(`✓ ${cmd} -> module: ${module}, type: ${type}, name: ${name}, params: ${parameters || 'none'}`);
    } else {
      console.log(`✗ ${cmd} -> Invalid format`);
    }
  });
}

// Test file system paths
function testFileSystem() {
  console.log('\nTesting file system...');
  
  const fs = require('fs');
  const projectRoot = process.cwd();
  
  // Test directories
  const testDirs = [
    '.gemini/commands',
    '.github/agents',
    '_bmad/sessions'
  ];
  
  testDirs.forEach(dir => {
    const fullPath = path.join(projectRoot, dir);
    const exists = fs.existsSync(fullPath);
    console.log(`${exists ? '✓' : '✗'} ${dir} -> ${fullPath} (${exists ? 'exists' : 'missing'})`);
  });
}

// Test basic file loading
async function testFileLoading() {
  console.log('\nTesting file loading...');
  
  const fs = require('fs').promises;
  const path = require('path');
  
  // Test loading a TOML file if it exists
  try {
    const commandsDir = path.join(process.cwd(), '.gemini/commands');
    const files = await fs.readdir(commandsDir);
    const tomlFiles = files.filter(file => file.endsWith('.toml'));
    console.log(`✓ Found ${tomlFiles.length} TOML files in .gemini/commands/`);
    
    if (tomlFiles.length > 0) {
      const firstFile = path.join(commandsDir, tomlFiles[0]);
      const content = await fs.readFile(firstFile, 'utf8');
      console.log(`✓ Sample file (${tomlFiles[0]}): ${content.length} characters`);
    }
  } catch (error) {
    console.log(`✗ Error reading .gemini/commands/: ${error.message}`);
  }
  
  // Test loading agent files if they exist
  try {
    const agentsDir = path.join(process.cwd(), '.github/agents');
    const files = await fs.readdir(agentsDir);
    const agentFiles = files.filter(file => file.endsWith('.agent.md'));
    console.log(`✓ Found ${agentFiles.length} agent files in .github/agents/`);
    
    if (agentFiles.length > 0) {
      const firstFile = path.join(agentsDir, agentFiles[0]);
      const content = await fs.readFile(firstFile, 'utf8');
      console.log(`✓ Sample agent file (${agentFiles[0]}): ${content.length} characters`);
    }
  } catch (error) {
    console.log(`✗ Error reading .github/agents/: ${error.message}`);
  }
}

// Run tests
async function runTests() {
  console.log('=== BMad System Test ===\n');
  
  testBMadParser();
  testFileSystem();
  await testFileLoading();
  
  console.log('\n=== Test Complete ===');
}

runTests().catch(console.error);