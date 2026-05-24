import type { Request, Response } from 'express';
import { getSession, jsonError, jsonOk } from '../../lib/http.js';
import { getTimeEntries, saveTimeEntry } from './timeEntries.service.js';
import { validateCreateTimeEntryInput } from './timeEntries.validators.js';

export async function listTimeEntriesController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session) return jsonError(res, 401, 'Autenticação obrigatória.');

    const requestedEmployeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
    const employeeId = session.role === 'gestor' ? requestedEmployeeId : session.sub;

    const entries = await getTimeEntries(employeeId);
    return jsonOk(res, { timeEntries: entries });
  } catch (error) {
    return jsonError(res, 500, error instanceof Error ? error.message : 'Falha ao listar pontos.');
  }
}

export async function createTimeEntryController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session) return jsonError(res, 401, 'Autenticação obrigatória.');

    const input = validateCreateTimeEntryInput(req.body);
    if (session.role !== 'gestor' && input.employeeId !== session.sub) {
      return jsonError(res, 403, 'Permissão insuficiente.');
    }

    const entry = await saveTimeEntry(input);
    return jsonOk(res, { timeEntry: entry });
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao salvar ponto.');
  }
}
