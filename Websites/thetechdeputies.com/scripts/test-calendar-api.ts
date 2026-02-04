/**
 * Test script to verify calendar API endpoints
 */

import { config } from 'dotenv';
import { resolve } from 'path';

config({ path: resolve(__dirname, '../.env.local') });

async function testAPI() {
    console.log('🧪 Testing Calendar API Endpoints\n');

    const baseUrl = 'http://localhost:3000';

    // Test 1: Get all events
    console.log('Test 1: GET /api/calendar-events (all events)');
    try {
        const response = await fetch(`${baseUrl}/api/calendar-events`);
        const data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`✅ Total events: ${data.events?.length || 0}`);
        if (data.events?.length > 0) {
            console.log(`   First event: ${data.events[0].title} at ${data.events[0].startTime}`);
        }
    } catch (error) {
        console.error('❌ Error:', (error as Error).message);
    }
    console.log('');

    // Test 2: Get events with date range (next 30 days)
    console.log('Test 2: GET /api/calendar-events (with date range)');
    try {
        const startDate = new Date();
        const endDate = new Date();
        endDate.setDate(endDate.getDate() + 30);

        const response = await fetch(
            `${baseUrl}/api/calendar-events?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        const data = await response.json();
        console.log(`✅ Status: ${response.status}`);
        console.log(`✅ Events in range: ${data.events?.length || 0}`);
        
        // Filter to future events (like the booking page does)
        const futureEvents = data.events?.filter(
            (e: any) => new Date(e.startTime) > new Date()
        ) || [];
        console.log(`✅ Future events: ${futureEvents.length}`);
        
        if (futureEvents.length > 0) {
            console.log('\n   📅 Sample future events:');
            futureEvents.slice(0, 5).forEach((event: any) => {
                const startDate = new Date(event.startTime);
                console.log(`   - ${event.title} (${startDate.toLocaleDateString()} ${startDate.toLocaleTimeString()})`);
            });
        }
    } catch (error) {
        console.error('❌ Error:', (error as Error).message);
    }
    console.log('');

    // Test 3: Current time info
    console.log('Test 3: Time Information');
    const now = new Date();
    console.log(`   Current time: ${now.toISOString()}`);
    console.log(`   Local time: ${now.toLocaleString()}`);
    console.log('');

    console.log('✨ All tests complete!');
}

testAPI().catch(console.error);
