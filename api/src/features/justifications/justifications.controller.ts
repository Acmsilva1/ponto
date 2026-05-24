import type { Request, Response } from 'express';
import { getSession, jsonError, jsonOk } from '../../lib/http.js';
import { getJustifications, saveJustification } from './justifications.service.js';
import { validateCreateJustificationInput } from './justifications.validators.js';

export async function listJustificationsController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session) return jsonError(res, 401, 'Autenticação obrigatória.');

    const requestedEmployeeId = req.query.employeeId ? String(req.query.employeeId) : undefined;
    const employeeId = session.role === 'gestor' ? requestedEmployeeId : session.sub;
    const justifications = await getJustifications(employeeId);
    return jsonOk(res, { justifications });
  } catch (error) {
    return jsonError(res, 500, error instanceof Error ? error.message : 'Falha ao listar justificativas.');
  }
}

export async function createJustificationController(req: Request, res: Response) {
  try {
    const session = getSession(req);
    if (!session) return jsonError(res, 401, 'Autenticação obrigatória.');

    const input = validateCreateJustificationInput(req.body);
    if (session.role !== 'gestor' && input.employeeId !== session.sub) {
      return jsonError(res, 403, 'Permissão insuficiente.');
    }

    const justification = await saveJustification(input);
    return jsonOk(res, { justification });
  } catch (error) {
    return jsonError(res, 400, error instanceof Error ? error.message : 'Falha ao salvar justificativa.');
  }
}
