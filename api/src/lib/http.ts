import type { NextFunction, Request, Response } from 'express';
import { env } from '../config/env.js';
import { verifySession } from './crypto.js';

export interface SessionPayload {
  sub: string;
  role: 'colaborador' | 'gestor';
  registryId: string;
  isMaster?: boolean;
  exp?: number;
}

export function getCookie(req: Request, name: string): string | null {
  const cookieHeader = req.headers.cookie;
  if (!cookieHeader) return null;

  const cookies = cookieHeader.split(';').map((item) => item.trim());
  for (const cookie of cookies) {
    const [cookieName, ...rest] = cookie.split('=');
    if (cookieName === name) {
      return decodeURIComponent(rest.join('='));
    }
  }
  return null;
}

export function setSessionCookie(res: Response, token: string) {
  const secure = env.nodeEnv === 'production';
  res.setHeader(
    'Set-Cookie',
    `pd_session=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; ${secure ? 'Secure;' : ''} Max-Age=${60 * 60 * 24 * 7}`
  );
}

export function clearSessionCookie(res: Response) {
  res.setHeader('Set-Cookie', 'pd_session=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0');
}

export function readSessionFromRequest(req: Request): SessionPayload | null {
  const token = getCookie(req, 'pd_session');
  if (!token) return null;

  const session = verifySession(token, env.sessionSecret) as SessionPayload | null;
  if (!session) return null;
  if (session.exp && Date.now() > session.exp) return null;
  return session;
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const session = readSessionFromRequest(req);
  if (!session) {
    return res.status(401).json({ ok: false, error: 'Autenticação obrigatória.' });
  }
  (req as Request & { session?: SessionPayload }).session = session;
  next();
}

export function requireRole(...allowedRoles: SessionPayload['role'][]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const session = (req as Request & { session?: SessionPayload }).session;
    if (!session) {
      return res.status(401).json({ ok: false, error: 'Autenticação obrigatória.' });
    }
    if (!allowedRoles.includes(session.role)) {
      return res.status(403).json({ ok: false, error: 'Permissão insuficiente.' });
    }
    next();
  };
}

export function getSession(req: Request): SessionPayload | null {
  return (req as Request & { session?: SessionPayload }).session || null;
}

export function jsonOk<T>(res: Response, data: T) {
  return res.json({ ok: true, ...data });
}

export function jsonError(res: Response, status: number, error: string) {
  return res.status(status).json({ ok: false, error });
}
