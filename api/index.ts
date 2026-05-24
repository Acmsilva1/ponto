import { createApp } from './src/app.js';

type AppInstance = Awaited<ReturnType<typeof createApp>>;

let appPromise: Promise<AppInstance> | null = null;

async function getApp() {
  if (!appPromise) {
    appPromise = createApp();
  }
  return appPromise;
}

export default async function handler(req: unknown, res: unknown) {
  const app = await getApp();
  const request = req as { url?: string };
  if (request.url) {
    const parsedUrl = new URL(request.url, 'http://localhost');
    const rewrittenPath = parsedUrl.searchParams.get('path');
    if (rewrittenPath) {
      const cleanPath = rewrittenPath.startsWith('/') ? rewrittenPath : `/${rewrittenPath}`;
      parsedUrl.searchParams.delete('path');
      request.url = `${cleanPath}${parsedUrl.searchParams.toString() ? `?${parsedUrl.searchParams.toString()}` : ''}`;
    }
  }
  return app(req as never, res as never);
}
