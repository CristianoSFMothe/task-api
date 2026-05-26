import { Test, TestingModule } from '@nestjs/testing';

import {
  mockAuthenticatedTaskRequest,
  mockCreateTaskDto,
  mockFindTasksDto,
} from '@/modules/tasks/__mocks__/tasks.mock';

import { TasksController } from '../tasks.controller';
import { TasksService } from '../tasks.service';

describe('TasksController', () => {
  let controller: TasksController;
  let tasksService: { create: jest.Mock; findAll: jest.Mock };

  beforeEach(async () => {
    tasksService = {
      create: jest.fn(),
      findAll: jest.fn(),
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
});
