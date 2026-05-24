import { getSupabaseClient } from '../../lib/supabase.js';
import type { EmployeeWithAuth } from '@shared/contracts';

const TABLE = 'employees';

function mapEmployee(row: any): EmployeeWithAuth {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    workHoursPerDay: Number(row.work_hours_per_day ?? 8),
    avatarColor: row.avatar_color ?? 'bg-indigo-600',
    registryId: row.registry_id,
    accessRole: row.access_role,
    isMaster: Boolean(row.is_master),
    mustChangePassword: Boolean(row.must_change_password),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    passwordHash: row.password_hash
  };
}

export async function listEmployees(): Promise<EmployeeWithAuth[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(mapEmployee);
}

export async function findEmployeeById(id: string): Promise<EmployeeWithAuth | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');
  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapEmployee(data) : null;
}
