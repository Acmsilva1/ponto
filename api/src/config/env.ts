export const env = {
  port: Number(process.env.PORT || 3001),
  nodeEnv: process.env.NODE_ENV || 'development',
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  supabaseUrl: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  sessionSecret: process.env.SESSION_SECRET || 'ponto-dev-secret-change-me',
  masterRegistryId: (process.env.MASTER_REGISTRY_ID || 'GESTOR').toUpperCase(),
  masterPassword: process.env.MASTER_PASSWORD || '12345'
};
