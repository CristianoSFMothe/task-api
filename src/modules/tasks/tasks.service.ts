import { ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { and, arrayContains, desc, eq, ilike, or, type SQL } from 'drizzle-orm';

import { messages } from '@/common/messages';
import { DATABASE_TOKEN } from '@/database/database.provider';
import type { DrizzleClient } from '@/database/drizzle.client';
import { tasks } from '@/database/schema';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user';
import { UsersService } from '@/modules/users/users.service';

import type { CreateTaskDto } from './dto/create-task.dto';
import type { FindTasksDto } from './dto/find-tasks.dto';
import {
  createTaskSchema,
  findTasksSchema,
  taskStatusValues,
} from './schemas/task.schema';

type TaskResponse = {
  id: string;
  title: string;
  description: string | null;
  tags: string[];
  status: (typeof taskStatusValues)[number];
  createdBy: string;
  userId: string;
  responsibleId: string | null;
};

const taskResponseColumns = {
  id: tasks.id,
  title: tasks.title,
  description: tasks.description,
  tags: tasks.tags,
  status: tasks.status,
  createdBy: tasks.createdBy,
  userId: tasks.userId,
  responsibleId: tasks.responsibleId,
};

const taskQueryColumns = {
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
export class TasksService {
  constructor(
    @Inject(DATABASE_TOKEN)
    private readonly db: DrizzleClient,
    private readonly usersService: UsersService,
  ) {}

  async create(
    authenticatedUser: AuthenticatedUser,
    createTaskDto: CreateTaskDto,
  ): Promise<TaskResponse> {
    const data = createTaskSchema.parse(createTaskDto);
    const taskUser = await this.resolveTaskUser(
      authenticatedUser,
      data.userEmail,
    );
    const responsibleUser = await this.resolveResponsibleUser(
      authenticatedUser,
      taskUser,
      data.responsibleEmail,
    );

    const [newTask] = await this.db
      .insert(tasks)
      .values({
        title: data.title,
        description: data.description ?? null,
        tags: data.tags,
        createdBy: authenticatedUser.name,
        userId: taskUser.id,
        responsibleId: responsibleUser?.id ?? null,
      })
      .returning(taskResponseColumns);

    return newTask;
  }

  findAll(
    authenticatedUser: AuthenticatedUser,
    filters: FindTasksDto = {},
  ): Promise<TaskResponse[]> {
    const data = findTasksSchema.parse(filters);
    const conditions: SQL[] = [];

    if (authenticatedUser.role !== 'ADMIN') {
      const visibilityCondition = or(
        eq(tasks.userId, authenticatedUser.userId),
        eq(tasks.responsibleId, authenticatedUser.userId),
      );

      if (visibilityCondition) {
        conditions.push(visibilityCondition);
      }
    }

    if (data.title) {
      conditions.push(ilike(tasks.title, `%${data.title}%`));
    }

    if (data.status) {
      conditions.push(eq(tasks.status, data.status));
    }

    if (data.tag) {
      conditions.push(arrayContains(tasks.tags, [data.tag]));
    }

    if (data.responsibleId) {
      conditions.push(eq(tasks.responsibleId, data.responsibleId));
    }

    return this.db.query.tasks.findMany({
      columns: taskQueryColumns,
      where: conditions.length > 0 ? and(...conditions) : undefined,
      orderBy: [desc(tasks.createdAt)],
    });
  }

  private async resolveTaskUser(
    authenticatedUser: AuthenticatedUser,
    userEmail?: string,
  ) {
    if (!userEmail || userEmail === authenticatedUser.email) {
      return {
        id: authenticatedUser.userId,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
      };
    }

    if (authenticatedUser.role !== 'ADMIN') {
      throw new ForbiddenException(messages.task.createForOtherUsersForbidden);
    }

    return this.usersService.findByEmail(userEmail);
  }

  private async resolveResponsibleUser(
    authenticatedUser: AuthenticatedUser,
    taskUser: { id: string; name: string; email: string },
    responsibleEmail?: string,
  ) {
    if (!responsibleEmail) {
      return null;
    }

    if (responsibleEmail === taskUser.email) {
      return taskUser;
    }

    if (responsibleEmail === authenticatedUser.email) {
      return {
        id: authenticatedUser.userId,
        name: authenticatedUser.name,
        email: authenticatedUser.email,
      };
    }

    return this.usersService.findByEmail(responsibleEmail);
  }
}
