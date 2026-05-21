import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from './schema';

export function createDrizzleClient(connectionString: string) {
  const client = postgres(connectionString, {
    max: 10,
    idle_timeout: 30,
  });

  return drizzle(client, {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });
}

export type DrizzleClient = ReturnType<typeof createDrizzleClient>;
