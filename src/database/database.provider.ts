import { ConfigService } from '@nestjs/config';

import type { EnvVariables } from '@/config/env';

import { createDrizzleClient } from './drizzle.client';

export const DATABASE_TOKEN = Symbol('DATABASE');

export const databaseProvider = {
  provide: DATABASE_TOKEN,
  inject: [ConfigService],
  useFactory: (config: ConfigService<EnvVariables, true>) => {
    const url = config.getOrThrow<string>('DATABASE_URL');
    return createDrizzleClient(url);
  },
};
