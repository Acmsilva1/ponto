import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { env } from '../config/env.js';

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient() {
  if (!env.supabaseUrl || !env.supabaseServiceRoleKey) {
    return null;
  }

  if (!supabaseInstance) {
    supabaseInstance = createClient(env.supabaseUrl, env.supabaseServiceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    });
  }

  return supabaseInstance;
}
