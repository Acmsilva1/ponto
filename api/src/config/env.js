import process from 'node:process';

const REQUIRED_ENVS = ['API_PREFIX'];

for (const envVar of REQUIRED_ENVS) {
  if (!process.env[envVar]) {
    throw new Error(`Critical infrastructure failure: Missing environment variable [${envVar}]`);
  }
}

export const env = {
  API_PREFIX: process.env.API_PREFIX ?? '/api/v1',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  PORT: Number(process.env.PORT ?? 3000)
};