import { Test, TestingModule } from '@nestjs/testing';

import {
  mockAuthenticatedTaskRequest,
  mockCreateTaskDto,
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

  it('should delegate findAll with authenticated user', async () => {
    tasksService.findAll.mockResolvedValue([{ id: 'task-id' }]);

    await expect(
      controller.findAll(mockAuthenticatedTaskRequest),
    ).resolves.toEqual([{ id: 'task-id' }]);

    expect(tasksService.findAll).toHaveBeenCalledWith(
      mockAuthenticatedTaskRequest.user,
    );
  });
});
