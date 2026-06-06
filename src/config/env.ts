export interface EnvVariables {
  ADMIN_EMAIL: string;
  ADMIN_NAME: string;
  ADMIN_PASSWORD: string;
  DATABASE_URL: string;
  JWT_EXPIRES_IN?: string;
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
}
