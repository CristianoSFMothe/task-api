import { Test, TestingModule } from '@nestjs/testing';

import {
  mockAuthenticatedTaskRequest,
  mockCreateTaskDto,
  mockDeletedTaskResponse,
  mockFindTasksDto,
  mockUpdateTaskStatusToInProgressDto,
} from '@/modules/tasks/__mocks__/tasks.mock';

import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: {
    create: jest.Mock;
    delete: jest.Mock;
    findAll: jest.Mock;
    updateStatus: jest.Mock;
  };

  beforeEach(async () => {
    tasksService = {
      create: jest.fn(),
      delete: jest.fn(),
      findAll: jest.fn(),
      updateStatus: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: tasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create with authenticated user', async () => {
    tasksService.create.mockResolvedValue({ id: 'task-id' });

    await expect(
      controller.create(mockAuthenticatedTaskRequest, mockCreateTaskDto),
    ).resolves.toEqual({ id: 'task-id' });

    expect(tasksService.create).toHaveBeenCalledWith(
      mockAuthenticatedTaskRequest.user,
      mockCreateTaskDto,
    );
  });

  it('should propagate create errors from service', async () => {
    const error = new Error('create failed');

    tasksService.create.mockRejectedValue(error);

    await expect(
      controller.create(mockAuthenticatedTaskRequest, mockCreateTaskDto),
    ).rejects.toBe(error);
  });

  it('should delegate findAll with authenticated user', async () => {
    tasksService.findAll.mockResolvedValue([{ id: 'task-id' }]);

    await expect(
      controller.findAll(mockAuthenticatedTaskRequest, mockFindTasksDto),
    ).resolves.toEqual([{ id: 'task-id' }]);

    expect(tasksService.findAll).toHaveBeenCalledWith(
      mockAuthenticatedTaskRequest.user,
      mockFindTasksDto,
    );
  });

  it('should propagate findAll errors from service', async () => {
    const error = new Error('list failed');

    tasksService.findAll.mockRejectedValue(error);

    await expect(
      controller.findAll(mockAuthenticatedTaskRequest, mockFindTasksDto),
    ).rejects.toBe(error);
  });

  it('should delegate updateStatus with authenticated user', async () => {
    tasksService.updateStatus.mockResolvedValue({
      id: 'task-id',
      status: 'IN_PROGRESS',
    });

    await expect(
      controller.updateStatus(
        mockAuthenticatedTaskRequest,
        'task-id',
        mockUpdateTaskStatusToInProgressDto,
      ),
    ).resolves.toEqual({ id: 'task-id', status: 'IN_PROGRESS' });

    expect(tasksService.updateStatus).toHaveBeenCalledWith(
      mockAuthenticatedTaskRequest.user,
      'task-id',
      mockUpdateTaskStatusToInProgressDto,
    );
  });

  it('should propagate updateStatus errors from service', async () => {
    const error = new Error('update failed');

    tasksService.updateStatus.mockRejectedValue(error);

    await expect(
      controller.updateStatus(
        mockAuthenticatedTaskRequest,
        'task-id',
        mockUpdateTaskStatusToInProgressDto,
      ),
    ).rejects.toBe(error);
  });

  it('should delegate delete with authenticated user', async () => {
    tasksService.delete.mockResolvedValue(mockDeletedTaskResponse);

    await expect(
      controller.delete(mockAuthenticatedTaskRequest, 'task-id'),
    ).resolves.toEqual(mockDeletedTaskResponse);

    expect(tasksService.delete).toHaveBeenCalledWith(
      mockAuthenticatedTaskRequest.user,
      'task-id',
    );
  });

  it('should propagate delete errors from service', async () => {
    const error = new Error('delete failed');

    tasksService.delete.mockRejectedValue(error);

    await expect(
      controller.delete(mockAuthenticatedTaskRequest, 'task-id'),
    ).rejects.toBe(error);
  });
});
