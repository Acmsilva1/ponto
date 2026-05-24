import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { authRoutes } from './features/auth/auth.routes.js';
import { employeesRoutes } from './features/employees/employees.routes.js';
import { timeEntriesRoutes } from './features/time-entries/timeEntries.routes.js';
import { justificationsRoutes } from './features/justifications/justifications.routes.js';
import { dashboardRoutes } from './features/dashboard/dashboard.routes.js';
import { bootstrapMasterAccount } from './features/auth/auth.service.js';

export async function createApp() {
  await bootstrapMasterAccount();

  const app = express();

  app.use(cors({
    origin: env.corsOrigin,
    credentials: true
  }));
  app.use(express.json({ limit: '1mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'api', status: 'healthy' });
  });

  app.use('/auth', authRoutes);
  app.use('/employees', employeesRoutes);
  app.use('/time-entries', timeEntriesRoutes);
  app.use('/justifications', justificationsRoutes);
  app.use('/dashboard', dashboardRoutes);

  app.use((_req, res) => {
    res.status(404).json({ ok: false, error: 'Rota não encontrada.' });
  });

  return app;
}
