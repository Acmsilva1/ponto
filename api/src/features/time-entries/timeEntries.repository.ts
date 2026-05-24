import { getSupabaseClient } from '../../lib/supabase.js';
import type { TimeEntry } from '../../../../shared/src/contracts.js';

const TABLE = 'time_entries';

function mapTimeEntry(row: any): TimeEntry {
  return {
    id: row.id,
    employeeId: row.employee_id,
    timestamp: row.timestamp,
    type: row.type,
    isManual: Boolean(row.is_manual),
    justification: row.justification ?? null,
    location: row.location ?? null,
    createdAt: row.created_at
  };
}

export async function listTimeEntries(employeeId?: string): Promise<TimeEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');
  let query = supabase.from(TABLE).select('*').order('timestamp', { ascending: false });
  if (employeeId) query = query.eq('employee_id', employeeId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(mapTimeEntry);
}

export async function createTimeEntry(entry: Omit<TimeEntry, 'id' | 'createdAt'>) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      employee_id: entry.employeeId,
      timestamp: entry.timestamp,
      type: entry.type,
      is_manual: entry.isManual,
      justification: entry.justification ?? null,
      location: entry.location ?? null
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapTimeEntry(data);
}
