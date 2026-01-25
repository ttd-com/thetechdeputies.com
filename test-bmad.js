/**
 * BMad System Test Script
 * 
 * Quick test of BMad functionality
 */

import { BMadEngine } from '../lib/bmad';

async function testBMadSystem() {
  console.log('🧪 Testing BMad System...\n');

  // Test 1: Command parsing
  console.log('📝 Test 1: Command Parsing');
  const parseResult = BMadEngine.execute('/bmad:core:agents:bmad-master');
  console.log('Parse Result:', {
    success: parseResult.success,
    executionTime: parseResult.executionTime,
    hasData: !!parseResult.data
  });

  if (!parseResult.success) {
    console.error('❌ Parse failed:', parseResult.error);
    return;
  }

  // Test 2: Load TOML commands
  console.log('\n📚 Test 2: Load TOML Commands');
  try {
    const commands = await BMadEngine.getStats();
    console.log('Commands loaded:', commands.commands.totalCommands);
    console.log('Commands by module:', commands.commands.commandsByModule);
  } catch (error) {
    console.error('❌ TOML loading failed:', error);
  }

  // Test 3: Search functionality
  console.log('\n🔍 Test 3: Search Functionality');
  try {
    const searchResults = await BMadEngine.search('prd');
    console.log('Search results:', {
      commandsFound: searchResults.commands.length,
      agentsFound: searchResults.agents.length
    });
  } catch (error) {
    console.error('❌ Search failed:', error);
  }

  console.log('\n✅ BMad System Tests Complete!');
}

// Only run if this file is executed directly
if (require.main === module) {
  testBMadSystem().catch(console.error);
}

export { testBMadSystem };