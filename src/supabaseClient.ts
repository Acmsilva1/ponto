import { createClient } from '@supabase/supabase-js';

const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

// Let's check if the keys exist and are not placeholder template strings
const isSupabaseConfigured = 
  supabaseUrl && 
  supabaseAnonKey && 
  supabaseUrl.startsWith('https://') &&
  !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_PUBLIC_KEY');

export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : null;

/**
 * Checks if Supabase connection is successful and active by making a simple metadata query
 */
export async function testSupabaseConnection(): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Try querying the employees table safely or checking a simple request
    const { error } = await supabase.from('employees').select('id').limit(1);
    if (error) {
      console.warn('Supabase connection warning - table might not exist yet:', error.message);
      // If error is database table not found, we're still connected, but if it is API key error, we're not.
      if (error.code === 'PGRST116' || error.message.includes('relation "employees" does not exist')) {
        return true; // connected to Supabase api, though migrations might be pending
      }
      return false;
    }
    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
}
