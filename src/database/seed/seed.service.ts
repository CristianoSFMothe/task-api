import {
  Inject,
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import type { EnvVariables } from '@/config/env';
import { DATABASE_TOKEN } from '@/database/database.provider';
import type { DrizzleClient } from '@/database/drizzle.client';
import { users } from '@/database/schema';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: DrizzleClient,
    private readonly config: ConfigService<EnvVariables, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    await this.seedAdminUser();
  }

  private async seedAdminUser(): Promise<void> {
    const name = this.config.getOrThrow<string>('ADMIN_NAME');
    const email = this.config.getOrThrow<string>('ADMIN_EMAIL');
    const password = this.config.getOrThrow<string>('ADMIN_PASSWORD');

    const existingAdmin = await this.db.query.users.findFirst({
      columns: { id: true },
      where: eq(users.email, email),
    });

    if (existingAdmin) {
      await this.db.delete(users).where(eq(users.email, email));
      this.logger.log(`Usuário admin (${email}) removido.`);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await this.db.insert(users).values({
      name,
      email,
      password: hashedPassword,
      role: 'ADMIN',
    });

    this.logger.log(`Usuário admin (${email}) cadastrado.`);
  }
}
