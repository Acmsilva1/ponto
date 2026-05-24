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
    const [employeesResult, timeEntriesResult] = await Promise.all([
      supabase.from('employees').select('id').limit(1),
      supabase.from('time_entries').select('id').limit(1)
    ]);

    const missingEmployeesTable =
      !!employeesResult.error &&
      (employeesResult.error.code === 'PGRST116' ||
        employeesResult.error.message.includes('relation "employees" does not exist'));

    const missingTimeEntriesTable =
      !!timeEntriesResult.error &&
      (timeEntriesResult.error.code === 'PGRST116' ||
        timeEntriesResult.error.message.includes('relation "time_entries" does not exist'));

    if (missingEmployeesTable || missingTimeEntriesTable) {
      console.warn('Supabase connected, but one or more tables are missing.');
      return false;
    }

    if (employeesResult.error) {
      console.error('Supabase connection error (employees):', employeesResult.error);
      return false;
    }

    if (timeEntriesResult.error) {
      console.error('Supabase connection error (time_entries):', timeEntriesResult.error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Supabase connection error:', err);
    return false;
  }
}
