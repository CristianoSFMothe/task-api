import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { DatabaseModule } from '@/database/database.module';
import { SeedModule } from '@/database/seed/seed.module';
import { AuthModule } from '@/modules/auth/auth.module';
import { TasksModule } from '@/modules/tasks/tasks.module';
import { UsersModule } from '@/modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    SeedModule,
    UsersModule,
    AuthModule,
    TasksModule,
  ],
})
export class AppModule {}
