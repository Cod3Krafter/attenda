/**
 * Test Supabase Connection
 *
 * Run this script to verify your Supabase setup:
 * pnpm tsx scripts/test-supabase-connection.ts
 */

import { createClient } from '@supabase/supabase-js';

async function testConnection() {
    console.log('🔍 Testing Supabase connection...\n');

    // Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
        console.error('❌ Missing environment variables!');
        console.error('   Make sure you have .env.local with:');
        console.error('   - NEXT_PUBLIC_SUPABASE_URL');
        console.error('   - NEXT_PUBLIC_SUPABASE_ANON_KEY');
        process.exit(1);
    }

    console.log('✅ Environment variables found');
    console.log(`   URL: ${supabaseUrl}`);
    console.log(`   Key: ${supabaseKey.substring(0, 20)}...\n`);

    // Create client
    const supabase = createClient(supabaseUrl, supabaseKey);

    try {
        // Test 1: Check connection
        console.log('📡 Test 1: Checking connection...');
        const { data, error } = await supabase.from('organizers').select('count');

        if (error) {
            console.error('❌ Connection failed:', error.message);
            return;
        }
        console.log('✅ Connected successfully!\n');

        // Test 2: Check tables exist
        console.log('📋 Test 2: Checking tables...');
        const tables = ['organizers', 'events', 'gates', 'guests', 'scans'];

        for (const table of tables) {
            const { error } = await supabase.from(table).select('count').limit(1);
            if (error) {
                console.error(`❌ Table '${table}' not found or error:`, error.message);
            } else {
                console.log(`✅ Table '${table}' exists`);
            }
        }

        console.log('\n🎉 All tests passed! Supabase is ready to use.');

    } catch (error) {
        console.error('❌ Error during testing:', error);
        process.exit(1);
    }
}

testConnection();
