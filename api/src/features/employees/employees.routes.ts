import { Router } from 'express';
import { listEmployeesController } from './employees.controller.js';
import { requireAuth, requireRole } from '../../lib/http.js';

export const employeesRoutes = Router();

employeesRoutes.get('/', requireAuth, requireRole('gestor'), listEmployeesController);
