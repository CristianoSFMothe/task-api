import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { and, arrayContains, desc, eq, ilike, or, type SQL } from 'drizzle-orm';

import { messages } from '@/common/messages';
import { DATABASE_TOKEN } from '@/database/database.provider';
import type { DrizzleClient } from '@/database/drizzle.client';
import { tasks } from '@/database/schema';
import type { AuthenticatedUser } from '@/modules/auth/types/authenticated-user';
import { UsersService } from '@/modules/users/users.service';

import type { CreateTaskDto } from './dto/create-task.dto';
import type { FindTasksDto } from './dto/find-tasks.dto';
import type { UpdateTaskStatusDto } from './dto/update-task-status.dto';
import {
  createTaskSchema,
  findTasksSchema,
  taskStatusValues,
  updateTaskStatusSchema,
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

type DeleteTaskResponse = {
  id: string;
  message: string;
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

const taskStatusUpdateColumns = {
  id: true,
  status: true,
  userId: true,
  responsibleId: true,
  isActive: true,
  startedAt: true,
} as const;

const taskDeleteLookupColumns = {
  id: true,
  userId: true,
  isActive: true,
} as const;

const taskDeleteColumns = {
  id: tasks.id,
};

const allowedTaskStatusTransitions: Record<
  (typeof taskStatusValues)[number],
  Array<(typeof taskStatusValues)[number]>
> = {
  PENDING: ['IN_PROGRESS', 'CANCELLED'],
  IN_PROGRESS: ['DONE', 'PAUSED', 'BLOCKED', 'CANCELLED'],
  PAUSED: ['IN_PROGRESS', 'BLOCKED', 'CANCELLED'],
  BLOCKED: ['IN_PROGRESS', 'PAUSED', 'CANCELLED'],
  DONE: [],
  CANCELLED: [],
};

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

    conditions.push(eq(tasks.isActive, true));

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

  async updateStatus(
    authenticatedUser: AuthenticatedUser,
    id: string,
    updateTaskStatusDto: UpdateTaskStatusDto,
  ): Promise<TaskResponse> {
    const data = updateTaskStatusSchema.parse(updateTaskStatusDto);
    const task = await this.db.query.tasks.findFirst({
      columns: taskStatusUpdateColumns,
      where: eq(tasks.id, id),
    });

    if (!task) {
      throw new NotFoundException(messages.task.notFound);
    }

    if (!task.isActive) {
      throw new NotFoundException(messages.task.notFound);
    }

    if (!this.canUpdateTaskStatus(authenticatedUser, task)) {
      throw new ForbiddenException(messages.task.updateStatusForbidden);
    }

    if (!this.isStatusTransitionAllowed(task.status, data.status)) {
      throw new BadRequestException(messages.task.invalidStatusTransition);
    }

    const now = new Date();
    const [updatedTask] = await this.db
      .update(tasks)
      .set(this.buildTaskStatusUpdatePayload(task.startedAt, data.status, now))
      .where(eq(tasks.id, id))
      .returning(taskResponseColumns);

    if (!updatedTask) {
      throw new NotFoundException(messages.task.notFound);
    }

    return updatedTask;
  }

  async delete(
    authenticatedUser: AuthenticatedUser,
    id: string,
  ): Promise<DeleteTaskResponse> {
    const task = await this.db.query.tasks.findFirst({
      columns: taskDeleteLookupColumns,
      where: eq(tasks.id, id),
    });

    if (!task) {
      throw new NotFoundException(messages.task.notFound);
    }

    if (authenticatedUser.role === 'ADMIN') {
      const [deletedTask] = await this.db
        .delete(tasks)
        .where(eq(tasks.id, id))
        .returning(taskDeleteColumns);

      if (!deletedTask) {
        throw new NotFoundException(messages.task.notFound);
      }

      return {
        id: deletedTask.id,
        message: messages.task.deletedSuccessfully,
      };
    }

    if (!task.isActive) {
      throw new NotFoundException(messages.task.notFound);
    }

    if (task.userId !== authenticatedUser.userId) {
      throw new ForbiddenException(messages.task.deleteForbidden);
    }

    const [deletedTask] = await this.db
      .update(tasks)
      .set({
        isActive: false,
        deletedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(tasks.id, id), eq(tasks.isActive, true)))
      .returning(taskDeleteColumns);

    if (!deletedTask) {
      throw new NotFoundException(messages.task.notFound);
    }

    return {
      id: deletedTask.id,
      message: messages.task.deletedSuccessfully,
    };
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

  private canUpdateTaskStatus(
    authenticatedUser: AuthenticatedUser,
    task: {
      userId: string;
      responsibleId: string | null;
    },
  ) {
    return (
      authenticatedUser.role === 'ADMIN' ||
      task.userId === authenticatedUser.userId ||
      task.responsibleId === authenticatedUser.userId
    );
  }

  private isStatusTransitionAllowed(
    currentStatus: (typeof taskStatusValues)[number],
    nextStatus: (typeof taskStatusValues)[number],
  ) {
    return allowedTaskStatusTransitions[currentStatus].includes(nextStatus);
  }

  private buildTaskStatusUpdatePayload(
    startedAt: Date | null,
    status: (typeof taskStatusValues)[number],
    now: Date,
  ) {
    const updatedPayload = {
      status,
      updatedAt: now,
      startedAt,
      completedAt: null as Date | null,
      completionTime: null as number | null,
    };

    if (status === 'IN_PROGRESS' && !startedAt) {
      updatedPayload.startedAt = now;
    }

    if (status === 'DONE') {
      updatedPayload.completedAt = now;
      updatedPayload.completionTime = startedAt
        ? Math.floor((now.getTime() - startedAt.getTime()) / 1000)
        : null;
    }

    return updatedPayload;
  }
}
