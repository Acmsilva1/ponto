export type TimeEntryType = 'entrada' | 'almoco_saida' | 'almoco_retorno' | 'saida';

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  description?: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  timestamp: string; // ISO String
  type: TimeEntryType;
  isManual?: boolean;
  justification?: string;
  location?: GeoLocationData;
}

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  workHoursPerDay: number; // usually 8
  avatarColor: string;
  registryId: string; // CTPS or registration number
  password?: string; // Optional password for portal sign-in
  accessRole?: 'colaborador' | 'gestor'; // Optional access role (default is 'colaborador')
}

export interface DailySummary {
  date: string; // YYYY-MM-DD
  entries: TimeEntry[];
  totalWorkMinutes: number;
  overtimeMinutes: number; // positive or negative
  lunchMinutes: number;
  isComplete: boolean;
  warnings: string[];
}
