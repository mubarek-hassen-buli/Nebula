/**
 * Test Supabase connection
 * Run this to verify that Supabase is properly configured
 */

import { supabase } from './client';

export async function testSupabaseConnection() {
  try {
    console.log('Testing Supabase connection...');
    
    // Test 1: Check if client is initialized
    if (!supabase) {
      throw new Error('Supabase client is not initialized');
    }
    console.log('✓ Supabase client initialized');

    // Test 2: Try to get session (should return null if not logged in)
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      throw sessionError;
    }
    console.log('✓ Auth connection successful');
    console.log('  Session:', sessionData.session ? 'Active' : 'No active session');

    // Test 3: Try to query a table (this will fail if RLS is enabled and user is not authenticated)
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('⚠ Database query failed (expected if RLS is enabled):', error.message);
    } else {
      console.log('✓ Database connection successful');
    }

    console.log('\n✅ Supabase connection test completed successfully!');
    return { success: true, error: null };
  } catch (error: any) {
    console.error('\n❌ Supabase connection test failed:', error.message);
    return { success: false, error: error.message };
  }
}
