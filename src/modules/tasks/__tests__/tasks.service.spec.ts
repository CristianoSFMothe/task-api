import { Test, TestingModule } from '@nestjs/testing';
import { ZodError } from 'zod';

import { messages } from '@/common/messages';
import { DATABASE_TOKEN } from '@/database/database.provider';
import {
  mockAdminTaskRequest,
  mockAuthenticatedTaskRequest,
  mockBlockedTaskRecord,
  mockCreatedTask,
  mockCreatedTaskForOtherUser,
  mockCreateTaskDto,
  mockCreateTaskDtoWithNormalization,
  mockCreateTaskForOtherUserDto,
  mockCreateTaskWithAuthenticatedUserAsResponsibleDto,
  mockCreateTaskWithResponsibleDto,
  mockCreateTaskWithTaskOwnerAsResponsibleDto,
  mockDeletedTaskResponse,
  mockDoneTaskRecord,
  mockFindTasksDto,
  mockFindTasksDtoWithNormalization,
  mockInactiveTaskRecord,
  mockInProgressTaskRecord,
  mockInvalidCreateTaskDto,
  mockInvalidFindTasksDto,
  mockInvalidUpdateTaskDto,
  mockInvalidUpdateTaskStatusDto,
  mockPendingTaskRecord,
  mockResponsibleId,
  mockResponsibleTaskRequest,
  mockTaskId,
  mockUnauthorizedTaskRequest,
  mockUpdatedTask,
  mockUpdateTaskDto,
  mockUpdateTaskDtoWithoutResponsible,
  mockUpdateTaskStatusToCancelledDto,
  mockUpdateTaskStatusToDoneDto,
  mockUpdateTaskStatusToInProgressDto,
  mockUpdateTaskStatusToPausedDto,
} from '@/modules/tasks/__mocks__/tasks.mock';
import { UsersService } from '@/modules/users/users.service';

import { TasksService } from '../tasks.service';

type MockDb = {
  delete: jest.Mock;
  insert: jest.Mock;
  update: jest.Mock;
  query: {
    tasks: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
  };
};

describe('TasksService', () => {
  let service: TasksService;
  let db: MockDb;
  let insertValuesMock: jest.Mock;
  let insertReturningMock: jest.Mock;
  let deleteWhereMock: jest.Mock;
  let deleteReturningMock: jest.Mock;
  let updateSetMock: jest.Mock;
  let updateWhereMock: jest.Mock;
  let updateReturningMock: jest.Mock;
  let usersService: {
    findByEmail: jest.Mock;
    findById: jest.Mock;
  };

  beforeEach(async () => {
    insertReturningMock = jest.fn();
    insertValuesMock = jest.fn(() => ({
      returning: insertReturningMock,
    }));

    deleteReturningMock = jest.fn();
    deleteWhereMock = jest.fn(() => ({
      returning: deleteReturningMock,
    }));

    updateReturningMock = jest.fn();
    updateWhereMock = jest.fn(() => ({
      returning: updateReturningMock,
    }));
    updateSetMock = jest.fn(() => ({
      where: updateWhereMock,
    }));

    db = {
      delete: jest.fn(() => ({
        where: deleteWhereMock,
      })),
      insert: jest.fn(() => ({
        values: insertValuesMock,
      })),
      update: jest.fn(() => ({
        set: updateSetMock,
      })),
      query: {
        tasks: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
    };

    usersService = {
      findByEmail: jest.fn(),
      findById: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: DATABASE_TOKEN,
          useValue: db,
        },
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a task for the authenticated user', async () => {
    insertReturningMock.mockResolvedValue([mockCreatedTask]);

    await expect(
      service.create(mockAuthenticatedTaskRequest.user, mockCreateTaskDto),
    ).resolves.toEqual(mockCreatedTask);

    expect(insertValuesMock).toHaveBeenCalledWith({
      title: 'Preparar documentação da API',
      description: 'Consolidar os endpoints do módulo de tarefas.',
      tags: ['backend', 'documentacao'],
      createdBy: 'John Doe',
      userId: mockAuthenticatedTaskRequest.user.userId,
      responsibleId: null,
    });
    expect(usersService.findByEmail).not.toHaveBeenCalled();
  });

  it('should normalize task payload before creating', async () => {
    insertReturningMock.mockResolvedValue([mockCreatedTask]);

    await service.create(
      mockAuthenticatedTaskRequest.user,
      mockCreateTaskDtoWithNormalization,
    );

    expect(insertValuesMock).toHaveBeenCalledWith({
      title: 'Preparar documentação da API',
      description: 'Consolidar os endpoints do módulo de tarefas.',
      tags: ['backend', 'documentacao'],
      createdBy: 'John Doe',
      userId: mockAuthenticatedTaskRequest.user.userId,
      responsibleId: null,
    });
  });

  it('should reject create when dto is invalid', async () => {
    await expect(
      service.create(
        mockAuthenticatedTaskRequest.user,
        mockInvalidCreateTaskDto,
      ),
    ).rejects.toBeInstanceOf(ZodError);

    expect(usersService.findByEmail).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('should reject create for another user when requester is not admin', async () => {
    await expect(
      service.create(
        mockAuthenticatedTaskRequest.user,
        mockCreateTaskForOtherUserDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.createForOtherUsersForbidden,
    });

    expect(usersService.findByEmail).not.toHaveBeenCalled();
    expect(db.insert).not.toHaveBeenCalled();
  });

  it('should allow admin to create a task for another user with a responsible user', async () => {
    usersService.findByEmail
      .mockResolvedValueOnce({
        id: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
        name: 'Jane Doe',
        email: 'jane@example.com',
      })
      .mockResolvedValueOnce({
        id: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
        name: 'Mary Doe',
        email: 'mary@example.com',
      });
    insertReturningMock.mockResolvedValue([mockCreatedTaskForOtherUser]);

    await expect(
      service.create(
        mockAdminTaskRequest.user,
        mockCreateTaskWithResponsibleDto,
      ),
    ).resolves.toEqual(mockCreatedTaskForOtherUser);

    expect(usersService.findByEmail).toHaveBeenNthCalledWith(
      1,
      'jane@example.com',
    );
    expect(usersService.findByEmail).toHaveBeenNthCalledWith(
      2,
      'mary@example.com',
    );
    expect(insertValuesMock).toHaveBeenCalledWith({
      title: 'Delegar revisão',
      description: null,
      tags: [],
      createdBy: 'Admin User',
      userId: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
      responsibleId: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
    });
  });

  it('should reuse task owner as responsible when responsible email matches task owner', async () => {
    usersService.findByEmail.mockResolvedValueOnce({
      id: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
    insertReturningMock.mockResolvedValue([mockCreatedTaskForOtherUser]);

    await expect(
      service.create(
        mockAdminTaskRequest.user,
        mockCreateTaskWithTaskOwnerAsResponsibleDto,
      ),
    ).resolves.toEqual(mockCreatedTaskForOtherUser);

    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(usersService.findByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(insertValuesMock).toHaveBeenCalledWith({
      title: 'Delegar revisão',
      description: null,
      tags: [],
      createdBy: 'Admin User',
      userId: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
      responsibleId: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
    });
  });

  it('should reuse authenticated user as responsible when responsible email matches requester', async () => {
    usersService.findByEmail.mockResolvedValueOnce({
      id: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
      name: 'Jane Doe',
      email: 'jane@example.com',
    });
    insertReturningMock.mockResolvedValue([
      {
        ...mockCreatedTaskForOtherUser,
        responsibleId: mockAdminTaskRequest.user.userId,
      },
    ]);

    await expect(
      service.create(
        mockAdminTaskRequest.user,
        mockCreateTaskWithAuthenticatedUserAsResponsibleDto,
      ),
    ).resolves.toEqual({
      ...mockCreatedTaskForOtherUser,
      responsibleId: mockAdminTaskRequest.user.userId,
    });

    expect(usersService.findByEmail).toHaveBeenCalledTimes(1);
    expect(usersService.findByEmail).toHaveBeenCalledWith('jane@example.com');
    expect(insertValuesMock).toHaveBeenCalledWith({
      title: 'Delegar revisão',
      description: null,
      tags: [],
      createdBy: 'Admin User',
      userId: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
      responsibleId: mockAdminTaskRequest.user.userId,
    });
  });

  it('should return all tasks for admin users', async () => {
    db.query.tasks.findMany.mockResolvedValue([
      mockCreatedTask,
      mockCreatedTaskForOtherUser,
    ]);

    await expect(service.findAll(mockAdminTaskRequest.user)).resolves.toEqual([
      mockCreatedTask,
      mockCreatedTaskForOtherUser,
    ]);

    const [queryArgs] = db.query.tasks.findMany.mock.calls[0] as [
      {
        where?: unknown;
      },
    ];

    expect(db.query.tasks.findMany).toHaveBeenCalledTimes(1);
    expect(queryArgs.where).toBeDefined();
  });

  it('should apply optional filters when listing tasks', async () => {
    db.query.tasks.findMany.mockResolvedValue([mockCreatedTask]);

    await expect(
      service.findAll(mockAdminTaskRequest.user, mockFindTasksDto),
    ).resolves.toEqual([mockCreatedTask]);

    const [queryArgs] = db.query.tasks.findMany.mock.calls[0] as [
      {
        columns: unknown;
        where: unknown;
        orderBy: unknown;
      },
    ];

    expect(queryArgs.columns).toBeDefined();
    expect(queryArgs.where).toBeDefined();
    expect(queryArgs.orderBy).toBeDefined();
  });

  it('should normalize list filters before querying', async () => {
    db.query.tasks.findMany.mockResolvedValue([mockCreatedTask]);

    await expect(
      service.findAll(
        mockAuthenticatedTaskRequest.user,
        mockFindTasksDtoWithNormalization,
      ),
    ).resolves.toEqual([mockCreatedTask]);

    const [queryArgs] = db.query.tasks.findMany.mock.calls[0] as [
      {
        where: unknown;
      },
    ];

    expect(queryArgs.where).toBeDefined();
  });

  it('should reject findAll when filters are invalid', () => {
    expect(() =>
      service.findAll(
        mockAuthenticatedTaskRequest.user,
        mockInvalidFindTasksDto as never,
      ),
    ).toThrow(ZodError);

    expect(db.query.tasks.findMany).not.toHaveBeenCalled();
  });

  it('should return only tasks visible to a regular user', async () => {
    db.query.tasks.findMany.mockResolvedValue([mockCreatedTask]);

    await expect(
      service.findAll(mockAuthenticatedTaskRequest.user),
    ).resolves.toEqual([mockCreatedTask]);

    expect(db.query.tasks.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return task by id for admin users', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockCreatedTask);

    await expect(
      service.findById(mockAdminTaskRequest.user, mockTaskId),
    ).resolves.toEqual(mockCreatedTask);

    expect(db.query.tasks.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should return task by id for visible regular users', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockCreatedTask);

    await expect(
      service.findById(mockAuthenticatedTaskRequest.user, mockTaskId),
    ).resolves.toEqual(mockCreatedTask);

    expect(db.query.tasks.findFirst).toHaveBeenCalledTimes(1);
  });

  it('should reject findById when task is not visible to regular users', async () => {
    db.query.tasks.findFirst.mockResolvedValue(undefined);

    await expect(
      service.findById(mockUnauthorizedTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });
  });

  it('should reject findById when task is inactive or missing', async () => {
    db.query.tasks.findFirst.mockResolvedValue(undefined);

    await expect(
      service.findById(mockAuthenticatedTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });
  });

  it('should update task fields for the owner user', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);
    usersService.findById.mockResolvedValue({
      id: mockUpdatedTask.responsibleId,
      name: 'Mary Doe',
      email: 'mary@example.com',
      tasks: [],
    });
    updateReturningMock.mockResolvedValue([mockUpdatedTask]);

    await expect(
      service.update(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskDto,
      ),
    ).resolves.toEqual(mockUpdatedTask);

    expect(usersService.findById).toHaveBeenCalledWith(mockResponsibleId);

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        updatedAt: Date;
        title: string;
        description: string | null;
        tags: string[];
        responsibleId: string | null;
      },
    ];

    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
    expect(updatePayload.title).toBe('Atualizar documentação da API');
    expect(updatePayload.description).toBeNull();
    expect(updatePayload.tags).toEqual(['api', 'backend']);
    expect(updatePayload.responsibleId).toBe(mockResponsibleId);
  });

  it('should allow admin to remove the responsible user from a task', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);
    updateReturningMock.mockResolvedValue([
      {
        ...mockCreatedTask,
        responsibleId: null,
      },
    ]);

    await expect(
      service.update(
        mockAdminTaskRequest.user,
        mockTaskId,
        mockUpdateTaskDtoWithoutResponsible,
      ),
    ).resolves.toEqual({
      ...mockCreatedTask,
      responsibleId: null,
    });

    expect(usersService.findById).not.toHaveBeenCalled();

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        updatedAt: Date;
        responsibleId: string | null;
      },
    ];

    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
    expect(updatePayload.responsibleId).toBeNull();
  });

  it('should reject update when task is not found', async () => {
    db.query.tasks.findFirst.mockResolvedValue(undefined);

    await expect(
      service.update(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject update when task is inactive', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockInactiveTaskRecord);

    await expect(
      service.update(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject update when requester is not the task owner or admin', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockBlockedTaskRecord);

    await expect(
      service.update(
        mockResponsibleTaskRequest.user,
        mockTaskId,
        mockUpdateTaskDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.updateForbidden,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject update when payload is invalid', async () => {
    await expect(
      service.update(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockInvalidUpdateTaskDto as never,
      ),
    ).rejects.toBeInstanceOf(ZodError);

    expect(db.query.tasks.findFirst).not.toHaveBeenCalled();
  });

  it('should reject update when no fields are provided', async () => {
    await expect(
      service.update(mockAuthenticatedTaskRequest.user, mockTaskId, {}),
    ).rejects.toBeInstanceOf(ZodError);

    expect(db.query.tasks.findFirst).not.toHaveBeenCalled();
  });

  it('should reject update when task disappears before update returns', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);
    usersService.findById.mockResolvedValue({
      id: mockResponsibleId,
      name: 'Mary Doe',
      email: 'mary@example.com',
      tasks: [],
    });
    updateReturningMock.mockResolvedValue([]);

    await expect(
      service.update(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });
  });

  it('should update task status from pending to in progress', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);
    updateReturningMock.mockResolvedValue([
      {
        ...mockCreatedTask,
        status: 'IN_PROGRESS',
      },
    ]);

    await expect(
      service.updateStatus(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToInProgressDto,
      ),
    ).resolves.toEqual({
      ...mockCreatedTask,
      status: 'IN_PROGRESS',
    });

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        status: string;
        updatedAt: Date;
        startedAt: Date | null;
        completedAt: Date | null;
        completionTime: number | null;
      },
    ];

    expect(updatePayload.status).toBe('IN_PROGRESS');
    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
    expect(updatePayload.startedAt).toBeInstanceOf(Date);
    expect(updatePayload.completedAt).toBeNull();
    expect(updatePayload.completionTime).toBeNull();
  });

  it('should update task status from in progress to done', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockInProgressTaskRecord);
    updateReturningMock.mockResolvedValue([
      {
        ...mockCreatedTask,
        status: 'DONE',
      },
    ]);

    await expect(
      service.updateStatus(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToDoneDto,
      ),
    ).resolves.toEqual({
      ...mockCreatedTask,
      status: 'DONE',
    });

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        status: string;
        updatedAt: Date;
        startedAt: Date | null;
        completedAt: Date | null;
        completionTime: number | null;
      },
    ];

    expect(updatePayload.status).toBe('DONE');
    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
    expect(updatePayload.startedAt).toBe(mockInProgressTaskRecord.startedAt);
    expect(updatePayload.completedAt).toBeInstanceOf(Date);
    expect(updatePayload.completionTime).toEqual(expect.any(Number));
  });

  it('should allow responsible user to update task status', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockBlockedTaskRecord);
    updateReturningMock.mockResolvedValue([
      {
        ...mockCreatedTaskForOtherUser,
        status: 'PAUSED',
      },
    ]);

    await expect(
      service.updateStatus(
        mockResponsibleTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToPausedDto,
      ),
    ).resolves.toEqual({
      ...mockCreatedTaskForOtherUser,
      status: 'PAUSED',
    });
  });

  it('should allow admin to cancel a task', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockBlockedTaskRecord);
    updateReturningMock.mockResolvedValue([
      {
        ...mockCreatedTaskForOtherUser,
        status: 'CANCELLED',
      },
    ]);

    await expect(
      service.updateStatus(
        mockAdminTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToCancelledDto,
      ),
    ).resolves.toEqual({
      ...mockCreatedTaskForOtherUser,
      status: 'CANCELLED',
    });
  });

  it('should reject updateStatus when task is not found', async () => {
    db.query.tasks.findFirst.mockResolvedValue(undefined);

    await expect(
      service.updateStatus(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToInProgressDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject updateStatus when requester cannot manage the task', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockBlockedTaskRecord);

    await expect(
      service.updateStatus(
        mockUnauthorizedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToPausedDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.updateStatusForbidden,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject updateStatus when transition is invalid', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);

    await expect(
      service.updateStatus(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToDoneDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.invalidStatusTransition,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject updateStatus when payload is invalid', async () => {
    await expect(
      service.updateStatus(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockInvalidUpdateTaskStatusDto as never,
      ),
    ).rejects.toBeInstanceOf(ZodError);

    expect(db.query.tasks.findFirst).not.toHaveBeenCalled();
  });

  it('should reject updateStatus when task disappears before update returns', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockInProgressTaskRecord);
    updateReturningMock.mockResolvedValue([]);

    await expect(
      service.updateStatus(
        mockAuthenticatedTaskRequest.user,
        mockTaskId,
        mockUpdateTaskStatusToDoneDto,
      ),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });
  });

  it('should soft delete an active task for the owner user', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);
    updateReturningMock.mockResolvedValue([{ id: mockTaskId }]);

    await expect(
      service.delete(mockAuthenticatedTaskRequest.user, mockTaskId),
    ).resolves.toEqual(mockDeletedTaskResponse);

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        isActive: boolean;
        deletedAt: Date;
        updatedAt: Date;
      },
    ];

    expect(updatePayload.isActive).toBe(false);
    expect(updatePayload.deletedAt).toBeInstanceOf(Date);
    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
    expect(db.delete).not.toHaveBeenCalled();
  });

  it('should hard delete a task for admin users', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockInactiveTaskRecord);
    deleteReturningMock.mockResolvedValue([{ id: mockTaskId }]);

    await expect(
      service.delete(mockAdminTaskRequest.user, mockTaskId),
    ).resolves.toEqual(mockDeletedTaskResponse);

    expect(db.delete).toHaveBeenCalledTimes(1);
    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject delete when task is not found', async () => {
    db.query.tasks.findFirst.mockResolvedValue(undefined);

    await expect(
      service.delete(mockAuthenticatedTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });
  });

  it('should reject delete for done tasks even for admin users', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockDoneTaskRecord);

    await expect(
      service.delete(mockAdminTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.deleteDoneForbidden,
    });

    expect(db.delete).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject delete for done tasks for regular users', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockDoneTaskRecord);

    await expect(
      service.delete(mockAuthenticatedTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.deleteDoneForbidden,
    });

    expect(db.delete).not.toHaveBeenCalled();
    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject soft delete for inactive tasks', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockInactiveTaskRecord);

    await expect(
      service.delete(mockAuthenticatedTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject soft delete when requester is not the task owner', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockBlockedTaskRecord);

    await expect(
      service.delete(mockResponsibleTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.deleteForbidden,
    });

    expect(db.update).not.toHaveBeenCalled();
  });

  it('should reject hard delete when task disappears before delete returns', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);
    deleteReturningMock.mockResolvedValue([]);

    await expect(
      service.delete(mockAdminTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });
  });

  it('should reject soft delete when task disappears before update returns', async () => {
    db.query.tasks.findFirst.mockResolvedValue(mockPendingTaskRecord);
    updateReturningMock.mockResolvedValue([]);

    await expect(
      service.delete(mockAuthenticatedTaskRequest.user, mockTaskId),
    ).rejects.toMatchObject({
      message: messages.task.notFound,
    });
  });
});
