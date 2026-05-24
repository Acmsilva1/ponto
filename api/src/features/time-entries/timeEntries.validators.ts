import type { TimeEntryJourney, TimeEntryType, GeoLocationData } from '../../../../shared/src/contracts.js';

const allowedTypes: TimeEntryType[] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida'];
const allowedJourneys: TimeEntryJourney[] = ['official', 'extra'];

export interface CreateTimeEntryInput {
  employeeId: string;
  timestamp: string;
  type: TimeEntryType;
  journey?: TimeEntryJourney;
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

  if (payload.journey && !allowedJourneys.includes(payload.journey)) {
    throw new Error('Jornada de marcação inválida.');
  }

  return {
    employeeId: String(payload.employeeId),
    timestamp: String(payload.timestamp),
    type: payload.type,
    journey: payload.journey || 'official',
    isManual: Boolean(payload.isManual),
    justification: payload.justification ?? null,
    location: payload.location ?? null
  };
}
