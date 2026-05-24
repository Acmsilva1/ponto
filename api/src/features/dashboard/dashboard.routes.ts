import { Router } from 'express';
import { requireAuth } from '../../lib/http.js';
import { dashboardController } from './dashboard.controller.js';

export const dashboardRoutes = Router();

dashboardRoutes.get('/', requireAuth, dashboardController);
