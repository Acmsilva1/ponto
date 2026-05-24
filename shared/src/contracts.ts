export type AccessRole = 'colaborador' | 'gestor';
export type TimeEntryType = 'entrada' | 'almoco_saida' | 'almoco_retorno' | 'saida';
export type JustificationStatus = 'pending' | 'approved' | 'rejected';

export interface Employee {
  id: string;
  name: string;
  role: string;
  department: string;
  workHoursPerDay: number;
  avatarColor: string;
  registryId: string;
  accessRole: AccessRole;
  isMaster?: boolean;
  mustChangePassword?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeWithAuth extends Employee {
  passwordHash?: string;
}

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  description?: string;
}

export interface TimeEntry {
  id: string;
  employeeId: string;
  timestamp: string;
  type: TimeEntryType;
  isManual: boolean;
  justification?: string | null;
  location?: GeoLocationData | null;
  createdAt?: string;
}

export interface Justification {
  id: string;
  employeeId: string;
  timeEntryId?: string | null;
  date: string;
  reason: string;
  status: JustificationStatus;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  createdAt?: string;
}

export interface AuthSession {
  token: string;
  employee: Employee;
}

export interface LoginInput {
  registryId: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  role: string;
  department: string;
  password: string;
}

export interface ManagerRegisterInput {
  name: string;
  role: string;
  registryId: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

export interface PasswordRecoveryInput {
  registryId: string;
}

export interface PasswordRecoveryResponse {
  employee: Employee;
  temporaryPassword: string;
}

export interface RegisterResponse {
  ok: true;
  session: AuthSession;
}

export interface LoginResponse {
  ok: true;
  session: AuthSession;
  requiresPasswordChange: boolean;
}

export interface ApiErrorResponse {
  ok: false;
  error: string;
}

export interface DashboardSummary {
  employeesCount: number;
  timeEntriesCount: number;
  justificationsCount: number;
  pendingJustificationsCount: number;
  todayEntriesCount: number;
}
