/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { ConfigService } from '@nestjs/config';

import type { EnvVariables } from '@/config/env';

import { createDrizzleClient } from './drizzle.client';

export const DATABASE_TOKEN = Symbol('DATABASE');

export const databaseProvider = {
  provide: DATABASE_TOKEN,
  inject: [ConfigService],
  useFactory: (config: ConfigService<EnvVariables, true>) => {
    const url = config.getOrThrow('DATABASE_URL');
    return createDrizzleClient(url);
  },
};
