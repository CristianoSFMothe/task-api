import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { eq } from 'drizzle-orm';

import { DATABASE_TOKEN } from '@/database/database.provider';
import type { DrizzleClient } from '@/database/drizzle.client';
import { users } from '@/database/schema';

import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateNameUserDto } from './dto/update-name-user.dto';
import {
  createUserSchema,
  deleteUserSchema,
  updateNameUserSchema,
} from './schemas/user.schema';

type UserResponse = {
  id: string;
  name: string;
  email: string;
};

type DeleteUserResponse = {
  id: string;
  message: string;
};

type UserWithStatus = UserResponse & {
  status: 'ACTIVE' | 'INACTIVE';
};

const userPublicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
};

const userDeleteColumns = {
  id: users.id,
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
      .returning(userPublicColumns);

    return newUser;
  }

  async findAll(): Promise<UserResponse[]> {
    return this.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      where: eq(users.status, 'ACTIVE'),
    });
  }

  async findById(id: string): Promise<UserResponse> {
    const user = await this.db.query.users.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
      where: eq(users.id, id),
    });

    if (!user || user.status === 'INACTIVE') {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.toUserResponse(user);
  }

  async findByEmail(email: string): Promise<UserResponse> {
    const user = await this.db.query.users.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      where: eq(users.email, email),
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return user;
  }

  async updateName(id: string, dto: UpdateNameUserDto): Promise<UserResponse> {
    const data = updateNameUserSchema.parse(dto);

    const [updatedUser] = await this.db
      .update(users)
      .set({
        name: data.name,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning(userPublicColumns);

    if (!updatedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return updatedUser;
  }

  async delete(id: string): Promise<DeleteUserResponse> {
    await this.findById(id);

    const data = deleteUserSchema.parse({
      status: 'INACTIVE',
    });

    const [deletedUser] = await this.db
      .update(users)
      .set({
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning(userDeleteColumns);

    if (!deletedUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      id: deletedUser.id,
      message: 'Usuário deletado com sucesso',
    };
  }

  private toUserResponse(user: UserWithStatus): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }
}
