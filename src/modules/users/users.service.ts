import { ConflictException, Inject, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { DATABASE_TOKEN } from '@/database/database.provider';
import type { DrizzleClient } from '@/database/drizzle.client';
import { users } from '@/database/schema';

import type { CreateUserDto } from './dto/create-user.dto';
import { createUserSchema } from './schemas/user.schema';

type UserResponse = {
  id: string;
  name: string;
  email: string;
};

@Injectable()
export class UsersService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: DrizzleClient,
  ) {}

  async create(dto: CreateUserDto): Promise<UserResponse> {
    const data = createUserSchema.parse(dto);

    const existingUser = await this.db.query.users.findFirst({
      where: eq(users.email, data.email),
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const [newUser] = await this.db
      .insert(users)
      .values({
        name: data.name,
        email: data.email,
        password: hashedPassword,
      })
      .returning({
        id: users.id,
        name: users.name,
        email: users.email,
      });

    return newUser;
  }
}
