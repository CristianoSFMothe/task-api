export interface EnvVariables {
  DATABASE_URL: string;
  JWT_EXPIRES_IN?: string;
  JWT_SECRET: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
}
