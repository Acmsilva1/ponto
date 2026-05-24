const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

type ApiSuccess<T> = { ok: true } & T;
type ApiFailure = { ok: false; error: string };

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {})
    },
    ...init
  });

  const data = (await response.json()) as ApiSuccess<T> | ApiFailure;

  if (!response.ok || !data.ok) {
    throw new Error('error' in data ? data.error : 'Falha na requisição.');
  }

  const { ok, ...payload } = data as ApiSuccess<T>;
  return payload as T;
}
