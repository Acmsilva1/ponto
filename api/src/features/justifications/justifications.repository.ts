import { getSupabaseClient } from '../../lib/supabase.js';
import type { Justification } from '../../../../shared/src/contracts.js';

const TABLE = 'justifications';

function mapJustification(row: any): Justification {
  return {
    id: row.id,
    employeeId: row.employee_id,
    timeEntryId: row.time_entry_id ?? null,
    date: row.date,
    reason: row.reason,
    status: row.status,
    reviewedBy: row.reviewed_by ?? null,
    reviewedAt: row.reviewed_at ?? null,
    createdAt: row.created_at
  };
}

export async function listJustifications(employeeId?: string): Promise<Justification[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  let query = supabase.from(TABLE).select('*').order('created_at', { ascending: false });
  if (employeeId) query = query.eq('employee_id', employeeId);
  const { data, error } = await query;
  if (error) throw new Error(error.message);
  return (data || []).map(mapJustification);
}

export async function createJustification(input: Omit<Justification, 'id' | 'createdAt'>) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      employee_id: input.employeeId,
      time_entry_id: input.timeEntryId ?? null,
      date: input.date,
      reason: input.reason,
      status: input.status,
      reviewed_by: input.reviewedBy ?? null,
      reviewed_at: input.reviewedAt ?? null
    })
    .select('*')
    .single();
  if (error) throw new Error(error.message);
  return mapJustification(data);
}
