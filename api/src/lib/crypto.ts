import { randomBytes, scrypt as scryptCb, createHmac, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, key] = stored.split(':');
  if (!salt || !key) return false;

  const derivedKey = (await scrypt(password, salt, 64)) as Buffer;
  const keyBuffer = Buffer.from(key, 'hex');
  if (keyBuffer.length !== derivedKey.length) return false;
  return timingSafeEqual(keyBuffer, derivedKey);
}

export function signSession(payload: Record<string, unknown>, secret: string): string {
  const body = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = createHmac('sha256', secret).update(body).digest('base64url');
  return `${body}.${signature}`;
}

export function verifySession(token: string, secret: string): Record<string, unknown> | null {
  const [body, signature] = token.split('.');
  if (!body || !signature) return null;
  const expected = createHmac('sha256', secret).update(body).digest('base64url');
  if (expected !== signature) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8')) as Record<string, unknown>;
    if (typeof payload.exp === 'number' && Date.now() > payload.exp) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
