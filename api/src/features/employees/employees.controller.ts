import type { Request, Response } from 'express';
import { jsonError, jsonOk } from '../../lib/http.js';
import { getEmployees } from './employees.service.js';

export async function listEmployeesController(_req: Request, res: Response) {
  try {
    const employees = await getEmployees();
    return jsonOk(res, { employees });
  } catch (error) {
    return jsonError(res, 500, error instanceof Error ? error.message : 'Falha ao listar colaboradores.');
  }
}
