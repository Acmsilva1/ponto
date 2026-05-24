import { getSupabaseClient } from '../../lib/supabase.js';
import type { EmployeeWithAuth } from '../../../../shared/src/contracts.js';

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

export async function findEmployeeByRegistryId(registryId: string): Promise<EmployeeWithAuth | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase
    .from(TABLE)
    .select('*')
    .eq('registry_id', registryId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? mapEmployee(data) : null;
}

export async function findMasterAccount(): Promise<EmployeeWithAuth | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase.from(TABLE).select('*').eq('is_master', true).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapEmployee(data) : null;
}

export async function findEmployeeById(id: string): Promise<EmployeeWithAuth | null> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase.from(TABLE).select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(error.message);
  return data ? mapEmployee(data) : null;
}

export async function listEmployees(): Promise<EmployeeWithAuth[]> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase.from(TABLE).select('*').order('created_at', { ascending: true });
  if (error) throw new Error(error.message);
  return (data || []).map(mapEmployee);
}

export async function createEmployee(input: Omit<EmployeeWithAuth, 'id' | 'createdAt' | 'updatedAt'>) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase
    .from(TABLE)
    .insert({
      name: input.name,
      role: input.role,
      department: input.department,
      work_hours_per_day: input.workHoursPerDay,
      avatar_color: input.avatarColor,
      registry_id: input.registryId,
      password_hash: input.passwordHash,
      access_role: input.accessRole,
      is_master: input.isMaster || false,
      must_change_password: input.mustChangePassword || false
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapEmployee(data);
}

export async function updatePassword(id: string, passwordHash: string, mustChangePassword = false) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      password_hash: passwordHash,
      must_change_password: mustChangePassword,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapEmployee(data);
}

export async function syncMasterAccount(id: string, registryId: string, passwordHash: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { data, error } = await supabase
    .from(TABLE)
    .update({
      name: 'Gestor Master',
      role: 'Administrador',
      department: 'Administração',
      registry_id: registryId,
      password_hash: passwordHash,
      access_role: 'gestor',
      is_master: true,
      must_change_password: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw new Error(error.message);
  return mapEmployee(data);
}

export async function logPasswordResetRequest(employeeId: string, temporaryPasswordHash: string) {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase não configurado.');

  const { error } = await supabase.from('password_reset_requests').insert({
    employee_id: employeeId,
    temporary_password_hash: temporaryPasswordHash
  });

  if (error) throw new Error(error.message);
}

export async function ensureMasterAccount(registryId: string, passwordHash: string) {
  const existing = await findEmployeeByRegistryId(registryId);
  if (existing) return existing;

  const currentMaster = await findMasterAccount();
  if (currentMaster) {
    return syncMasterAccount(currentMaster.id, registryId, passwordHash);
  }

  return createEmployee({
    name: 'Gestor Master',
    role: 'Administrador',
    department: 'Administração',
    workHoursPerDay: 8,
    avatarColor: 'bg-slate-900',
    registryId,
    passwordHash,
    accessRole: 'gestor',
    isMaster: true,
    mustChangePassword: false
  });
}

export type AuthEmployee = EmployeeWithAuth;
