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
  return app(req as never, res as never);
}
