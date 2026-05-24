import type { TimeEntryType, GeoLocationData } from '../../../../shared/src/contracts.js';

const allowedTypes: TimeEntryType[] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida', 'extra'];

export interface CreateTimeEntryInput {
  employeeId: string;
  timestamp: string;
  type: TimeEntryType;
  isManual?: boolean;
  justification?: string | null;
  location?: GeoLocationData | null;
}

export function validateCreateTimeEntryInput(input: unknown): CreateTimeEntryInput {
  const payload = input as Partial<CreateTimeEntryInput>;
  if (!payload.employeeId || !payload.timestamp || !payload.type) {
    throw new Error('employeeId, timestamp e type são obrigatórios.');
  }

  if (!allowedTypes.includes(payload.type)) {
    throw new Error('Tipo de marcação inválido.');
  }

  return {
    employeeId: String(payload.employeeId),
    timestamp: String(payload.timestamp),
    type: payload.type as TimeEntryType,
    isManual: Boolean(payload.isManual),
    justification: payload.justification ?? null,
    location: payload.location ?? null
  };
}
