import { createTimeEntry, listTimeEntries } from './timeEntries.repository.js';
import type { CreateTimeEntryInput } from './timeEntries.validators.js';

const officialTypes: CreateTimeEntryInput['type'][] = ['entrada', 'almoco_saida', 'almoco_retorno', 'saida'];

const typeLabels: Record<CreateTimeEntryInput['type'], string> = {
  entrada: 'Entrada',
  almoco_saida: 'Início do intervalo',
  almoco_retorno: 'Retorno do intervalo',
  saida: 'Saída final'
};

function getBrasiliaDateKey(timestamp: string) {
  const date = new Date(timestamp);

  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).format(date);
}

export async function getTimeEntries(employeeId?: string) {
  return listTimeEntries(employeeId);
}

export async function saveTimeEntry(input: CreateTimeEntryInput) {
  const existingEntries = await listTimeEntries(input.employeeId);
  const currentDayEntries = existingEntries.filter(
    (entry) => getBrasiliaDateKey(entry.timestamp) === getBrasiliaDateKey(input.timestamp)
  );

  const officialDayEntries = currentDayEntries.filter((entry) => entry.journey === 'official');
  const extraDayEntries = currentDayEntries.filter((entry) => entry.journey === 'extra');

  if (input.journey === 'extra') {
    const officialExit = [...officialDayEntries]
      .filter((entry) => entry.type === 'saida')
      .sort((left, right) => left.timestamp.localeCompare(right.timestamp))
      .at(-1);

    if (!officialExit || new Date(input.timestamp).getTime() <= new Date(officialExit.timestamp).getTime()) {
      throw new Error('O período de trabalho vigente está em atividade ainda.');
    }

    if (extraDayEntries.some((entry) => entry.type === input.type)) {
      throw new Error(`Já existe uma marcação de ${typeLabels[input.type]} na jornada extra para este dia.`);
    }

    if (extraDayEntries.length >= 4) {
      throw new Error('A jornada extra já possui as 4 marcações permitidas.');
    }
  } else {
    if (officialDayEntries.some((entry) => entry.type === input.type)) {
      throw new Error(`Já existe uma marcação de ${typeLabels[input.type]} para este dia.`);
    }

    if (officialDayEntries.length >= 4) {
      throw new Error('Este dia já possui as 4 marcações permitidas.');
    }
  }

  return createTimeEntry({
    employeeId: input.employeeId,
    timestamp: input.timestamp,
    type: input.type,
    journey: input.journey || 'official',
    isManual: Boolean(input.isManual),
    justification: input.justification ?? null,
    location: input.location ?? null
  });
}
