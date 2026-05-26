import {
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { and, desc, eq, ilike, inArray } from 'drizzle-orm';

import { messages } from '@/common/messages';
import { DATABASE_TOKEN } from '@/database/database.provider';
import type { DrizzleClient } from '@/database/drizzle.client';
import { tasks, users } from '@/database/schema';
import type { UserRole } from '@/database/schema/users.schema';

import type { CreateUserDto } from './dto/create-user.dto';
import type { UpdateNameUserDto } from './dto/update-name-user.dto';
import {
  createUserSchema,
  deleteUserSchema,
  findUserByNameSchema,
  updateNameUserSchema,
  userStatusSchema,
} from './schemas/user.schema';

type UserResponse = {
  id: string;
  name: string;
  email: string;
};

type UserTaskResponse = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  status:
    | 'PENDING'
    | 'IN_PROGRESS'
    | 'PAUSED'
    | 'BLOCKED'
    | 'DONE'
    | 'CANCELLED';
  createdBy: string;
  userId: string;
  responsibleId: string | null;
};

type DeleteUserResponse = {
  id: string;
  message: string;
};

type UpdateUserStatusResponse = {
  id: string;
  message: string;
};

type FindByIdOptions = {
  includeRole?: boolean;
};

export type UserAuthResponse = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  status: 'ACTIVE' | 'INACTIVE';
};

type UserWithStatus = UserResponse & {
  status: 'ACTIVE' | 'INACTIVE';
};

type UserWithRole = UserResponse & {
  role: UserRole;
};

type UserWithTasks = UserResponse & {
  tasks: UserTaskResponse[];
};

type UserWithStatusAndRole = UserWithRole & {
  status: 'ACTIVE' | 'INACTIVE';
};

type UserWithRoleAndTasks = UserWithRole & {
  tasks: UserTaskResponse[];
};

const userPublicColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
};

const userDeleteColumns = {
  id: users.id,
};

const userTaskColumns = {
  id: true,
  title: true,
  description: true,
  tags: true,
  status: true,
  createdBy: true,
  userId: true,
  responsibleId: true,
} as const;

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
      throw new ConflictException(messages.user.emailAlreadyRegistered);
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

  async findAll(): Promise<UserWithTasks[]> {
    const activeUsers = await this.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      where: eq(users.status, 'ACTIVE'),
    });

    return this.attachTasksToUsers(activeUsers);
  }

  async findById(
    id: string,
    options: { includeRole: true },
  ): Promise<UserWithRoleAndTasks>;
  async findById(id: string, options?: FindByIdOptions): Promise<UserWithTasks>;
  async findById(
    id: string,
    options?: FindByIdOptions,
  ): Promise<UserWithTasks | UserWithRoleAndTasks> {
    const user = await this.findUserByIdWithStatus(id);

    if (!user || user.status === 'INACTIVE') {
      throw new NotFoundException(messages.user.notFound);
    }

    if (options?.includeRole) {
      const userWithRole = await this.findUserByIdWithStatusAndRole(id);

      if (!userWithRole || userWithRole.status === 'INACTIVE') {
        throw new NotFoundException(messages.user.notFound);
      }

      return this.attachTasksToUser(this.toUserWithRoleResponse(userWithRole));
    }

    return this.attachTasksToUser(this.toUserResponse(user));
  }

  async findByEmail(email: string): Promise<UserWithTasks> {
    const user = await this.db.query.users.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
      where: eq(users.email, email),
    });

    if (!user || user.status === 'INACTIVE') {
      throw new NotFoundException(messages.user.notFound);
    }

    return this.attachTasksToUser(this.toUserResponse(user));
  }

  async findByName(name: string): Promise<UserWithTasks[]> {
    const data = findUserByNameSchema.parse({ name });

    const foundUsers = await this.db.query.users.findMany({
      columns: {
        id: true,
        name: true,
        email: true,
      },
      where: and(
        eq(users.status, 'ACTIVE'),
        ilike(users.name, `%${data.name}%`),
      ),
    });

    if (foundUsers.length === 0) {
      throw new NotFoundException(messages.user.notFound);
    }

    return this.attachTasksToUsers(foundUsers);
  }

  async findAuthUserByEmail(email: string): Promise<UserAuthResponse> {
    const user = await this.db.query.users.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        password: true,
        role: true,
        status: true,
      },
      where: eq(users.email, email),
    });

    if (!user || user.status === 'INACTIVE') {
      throw new NotFoundException(messages.user.notFound);
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
      throw new NotFoundException(messages.user.notFound);
    }

    return updatedUser;
  }

  async delete(id: string): Promise<DeleteUserResponse> {
    const user = await this.findUserByIdWithStatus(id);

    if (!user || user.status === 'INACTIVE') {
      throw new NotFoundException(messages.user.notFound);
    }

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
      throw new NotFoundException(messages.user.notFound);
    }

    return {
      id: deletedUser.id,
      message: messages.user.deletedSuccessfully,
    };
  }

  async updateStatus(id: string): Promise<UpdateUserStatusResponse> {
    const user = await this.findUserByIdWithStatus(id);

    if (!user) {
      throw new NotFoundException(messages.user.notFound);
    }

    if (user.status === 'ACTIVE') {
      return {
        id: user.id,
        message: messages.user.alreadyActive,
      };
    }

    const status = userStatusSchema.parse('ACTIVE');

    const [updatedUser] = await this.db
      .update(users)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning(userDeleteColumns);

    if (!updatedUser) {
      throw new NotFoundException(messages.user.notFound);
    }

    return {
      id: updatedUser.id,
      message: messages.user.statusUpdatedSuccessfully,
    };
  }

  private toUserResponse(user: UserWithStatus): UserResponse {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  private toUserWithRoleResponse(user: UserWithStatusAndRole): UserWithRole {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };
  }

  private async attachTasksToUser<T extends { id: string }>(
    user: T,
  ): Promise<T & { tasks: UserTaskResponse[] }> {
    const createdTasks = await this.db.query.tasks.findMany({
      columns: userTaskColumns,
      where: eq(tasks.userId, user.id),
      orderBy: [desc(tasks.createdAt)],
    });

    return {
      ...user,
      tasks: createdTasks,
    };
  }

  private async attachTasksToUsers<T extends { id: string }>(
    foundUsers: T[],
  ): Promise<Array<T & { tasks: UserTaskResponse[] }>> {
    if (foundUsers.length === 0) {
      return [];
    }

    const userIds = foundUsers.map((user) => user.id);
    const createdTasks = await this.db.query.tasks.findMany({
      columns: userTaskColumns,
      where: inArray(tasks.userId, userIds),
      orderBy: [desc(tasks.createdAt)],
    });

    const tasksByUserId = new Map<string, UserTaskResponse[]>();

    for (const task of createdTasks) {
      const tasksForUser = tasksByUserId.get(task.userId) ?? [];
      tasksForUser.push(task);
      tasksByUserId.set(task.userId, tasksForUser);
    }

    return foundUsers.map((user) => ({
      ...user,
      tasks: tasksByUserId.get(user.id) ?? [],
    }));
  }

  private findUserByIdWithStatus(
    id: string,
  ): Promise<UserWithStatus | undefined> {
    return this.db.query.users.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        status: true,
      },
      where: eq(users.id, id),
    });
  }

  private findUserByIdWithStatusAndRole(
    id: string,
  ): Promise<UserWithStatusAndRole | undefined> {
    return this.db.query.users.findFirst({
      columns: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
      },
      where: eq(users.id, id),
    });
  }
}
