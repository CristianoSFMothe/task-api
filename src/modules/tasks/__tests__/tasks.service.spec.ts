import { Test, TestingModule } from '@nestjs/testing';
import { ZodError } from 'zod';

import { messages } from '@/common/messages';
import { DATABASE_TOKEN } from '@/database/database.provider';
import {
  mockAdminTaskRequest,
  mockAuthenticatedTaskRequest,
  mockCreatedTask,
  mockCreatedTaskForOtherUser,
  mockCreateTaskDto,
  mockCreateTaskDtoWithNormalization,
  mockCreateTaskForOtherUserDto,
  mockCreateTaskWithResponsibleDto,
  mockInvalidCreateTaskDto,
} from '@/modules/tasks/__mocks__/tasks.mock';
import { UsersService } from '@/modules/users/users.service';

import { TasksService } from '../tasks.service';

type MockDb = {
  insert: jest.Mock;
  query: {
    tasks: {
      findMany: jest.Mock;
    };
  };
};

describe('TasksService', () => {
  let service: TasksService;
  let db: MockDb;
  let insertValuesMock: jest.Mock;
  let insertReturningMock: jest.Mock;
  let usersService: {
    findByEmail: jest.Mock;
  };

  beforeEach(async () => {
    insertReturningMock = jest.fn();
    insertValuesMock = jest.fn(() => ({
      returning: insertReturningMock,
    }));

    db = {
      insert: jest.fn(() => ({
        values: insertValuesMock,
      })),
      query: {
        tasks: {
          findMany: jest.fn(),
        },
      },
    };

    usersService = {
      findByEmail: jest.fn(),
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

  it('should return all tasks for admin users', async () => {
    db.query.tasks.findMany.mockResolvedValue([
      mockCreatedTask,
      mockCreatedTaskForOtherUser,
    ]);

    await expect(service.findAll(mockAdminTaskRequest.user)).resolves.toEqual([
      mockCreatedTask,
      mockCreatedTaskForOtherUser,
    ]);

    expect(db.query.tasks.findMany).toHaveBeenCalledTimes(1);
  });

  it('should return only tasks visible to a regular user', async () => {
    db.query.tasks.findMany.mockResolvedValue([mockCreatedTask]);

    await expect(
      service.findAll(mockAuthenticatedTaskRequest.user),
    ).resolves.toEqual([mockCreatedTask]);

    expect(db.query.tasks.findMany).toHaveBeenCalledTimes(1);
  });
});
