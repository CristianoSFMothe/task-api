export interface EnvVariables {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'production' | 'test';
  PORT?: string;
}
