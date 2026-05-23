import { supabase } from './supabaseClient';
import { Employee, TimeEntry, TimeEntryType, GeoLocationData } from './types';

// Let's check if Supabase is active
export const hasSupabase = !!supabase;

/**
 * Map PostgreSQL db rows back into Employee interface
 */
export function mapSupabaseEmployee(row: any): Employee {
  return {
    id: row.id,
    name: row.name,
    role: row.role,
    department: row.department,
    workHoursPerDay: Number(row.work_hours_per_day ?? row.workHoursPerDay ?? 8),
    avatarColor: row.avatar_color ?? row.avatarColor ?? 'bg-indigo-600',
    registryId: row.registry_id ?? row.registryId ?? `REG-${Math.floor(10000 + Math.random() * 90000)}`
  };
}

/**
 * Map PostgreSQL db rows back into TimeEntry interface
 */
export function mapSupabaseTimeEntry(row: any): TimeEntry {
  let locationData: GeoLocationData | undefined = undefined;
  if (row.location) {
    if (typeof row.location === 'string') {
      try {
        locationData = JSON.parse(row.location);
      } catch (e) {
        // failed to parse
      }
    } else {
      locationData = row.location;
    }
  }

  return {
    id: row.id,
    employeeId: row.employee_id ?? row.employeeId,
    timestamp: row.timestamp,
    type: row.type as TimeEntryType,
    isManual: !!(row.is_manual ?? row.isManual),
    justification: row.justification || undefined,
    location: locationData
  };
}

/**
 * Retrieve all employees from Supabase table
 */
export async function getEmployees(): Promise<{ data: Employee[] | null, error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase client is not initialized') };
  }
  try {
    const { data, error } = await supabase
      .from('employees')
      .select('*')
      .order('name', { ascending: true });
    
    if (error) {
      console.error('Error fetching employees:', error);
      return { data: null, error };
    }
    
    const mapped = (data || []).map(mapSupabaseEmployee);
    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Retrieve all time entries from Supabase table
 */
export async function getTimeEntries(): Promise<{ data: TimeEntry[] | null, error: any }> {
  if (!supabase) {
    return { data: null, error: new Error('Supabase client is not initialized') };
  }
  try {
    const { data, error } = await supabase
      .from('time_entries')
      .select('*')
      .order('timestamp', { ascending: false });
    
    if (error) {
      console.error('Error fetching time entries:', error);
      return { data: null, error };
    }
    
    const mapped = (data || []).map(mapSupabaseTimeEntry);
    return { data: mapped, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
}

/**
 * Create or save an employee in Supabase
 */
export async function insertEmployee(employee: Employee): Promise<boolean> {
  if (!supabase) return false;
  try {
    // Attempting to write with support for both standard default snake_case column names and fallback systems
    const payload = {
      id: employee.id,
      name: employee.name,
      role: employee.role,
      department: employee.department,
      work_hours_per_day: employee.workHoursPerDay,
      avatar_color: employee.avatarColor,
      registry_id: employee.registryId
    };

    const { error } = await supabase.from('employees').upsert(payload);
    if (error) {
      console.error('Supabase insertEmployee error:', error);
      // Double check in case their columns are in camelCase instead of typical snake_case
      const fallbackPayload = {
        id: employee.id,
        name: employee.name,
        role: employee.role,
        department: employee.department,
        workHoursPerDay: employee.workHoursPerDay,
        avatarColor: employee.avatarColor,
        registryId: employee.registryId
      };
      const { error: fallbackError } = await supabase.from('employees').upsert(fallbackPayload);
      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
    }
    return true;
  } catch (err) {
    console.error('Error saving employee to Supabase:', err);
    return false;
  }
}

/**
 * Create a time entry in Supabase
 */
export async function insertTimeEntry(entry: TimeEntry): Promise<boolean> {
  if (!supabase) return false;
  try {
    const payload = {
      id: entry.id,
      employee_id: entry.employeeId,
      timestamp: entry.timestamp,
      type: entry.type,
      is_manual: entry.isManual || false,
      justification: entry.justification || null,
      location: entry.location || null
    };

    const { error } = await supabase.from('time_entries').insert(payload);
    if (error) {
      console.error('Supabase insertTimeEntry error:', error);
      // Check camelCase columns fallback
      const fallbackPayload = {
        id: entry.id,
        employeeId: entry.employeeId,
        timestamp: entry.timestamp,
        type: entry.type,
        isManual: entry.isManual || false,
        justification: entry.justification || null,
        location: entry.location || null
      };
      const { error: fallbackError } = await supabase.from('time_entries').insert(fallbackPayload);
      if (fallbackError) {
        throw new Error(fallbackError.message);
      }
    }
    return true;
  } catch (err) {
    console.error('Error saving time entry to Supabase:', err);
    return false;
  }
}
