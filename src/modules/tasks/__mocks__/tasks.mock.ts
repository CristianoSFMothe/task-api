import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import type { CreateTaskDto } from '../dto/create-task.dto';
import type { FindTasksDto } from '../dto/find-tasks.dto';
import type { UpdateTaskStatusDto } from '../dto/update-task-status.dto';

export const mockTaskId = '8f0506ab-70d3-4aab-bec9-6bd22fba8a70';
export const mockTaskOwnerId = '6f0506ab-70d3-4aab-bec9-6bd22fba8a66';
export const mockResponsibleId = '7f0506ab-70d3-4aab-bec9-6bd22fba8a69';

export const mockAuthenticatedTaskRequest = {
  user: {
    userId: mockTaskOwnerId,
    email: 'john@example.com',
    name: 'John Doe',
    role: 'USER',
  },
} as RequestWithUser;

export const mockAdminTaskRequest = {
  user: {
    userId: '9f0506ab-70d3-4aab-bec9-6bd22fba8a71',
    email: 'admin@example.com',
    name: 'Admin User',
    role: 'ADMIN',
  },
} as RequestWithUser;

export const mockResponsibleTaskRequest = {
  user: {
    userId: mockResponsibleId,
    email: 'mary@example.com',
    name: 'Mary Doe',
    role: 'USER',
  },
} as RequestWithUser;

export const mockUnauthorizedTaskRequest = {
  user: {
    userId: '4f0506ab-70d3-4aab-bec9-6bd22fba8a72',
    email: 'outsider@example.com',
    name: 'Outsider User',
    role: 'USER',
  },
} as RequestWithUser;

export const mockCreateTaskDto: CreateTaskDto = {
  title: 'Preparar documentação da API',
  description: 'Consolidar os endpoints do módulo de tarefas.',
  tags: ['backend', 'documentacao'],
};

export const mockCreateTaskDtoWithNormalization: CreateTaskDto = {
  title: '  Preparar documentação da API  ',
  description: '  Consolidar os endpoints do módulo de tarefas.  ',
  tags: [' backend ', 'documentacao'],
};

export const mockCreateTaskForOtherUserDto: CreateTaskDto = {
  title: 'Delegar revisão',
  userEmail: 'jane@example.com',
};

export const mockCreateTaskWithResponsibleDto: CreateTaskDto = {
  title: 'Delegar revisão',
  userEmail: 'jane@example.com',
  responsibleEmail: 'mary@example.com',
};

export const mockCreateTaskWithTaskOwnerAsResponsibleDto: CreateTaskDto = {
  title: 'Delegar revisão',
  userEmail: 'jane@example.com',
  responsibleEmail: 'jane@example.com',
};

export const mockCreateTaskWithAuthenticatedUserAsResponsibleDto: CreateTaskDto =
  {
    title: 'Delegar revisão',
    userEmail: 'jane@example.com',
    responsibleEmail: 'admin@example.com',
  };

export const mockInvalidCreateTaskDto: CreateTaskDto = {
  title: '   ',
  responsibleEmail: 'invalid-email',
};

export const mockFindTasksDto: FindTasksDto = {
  title: 'documentação',
  status: 'PENDING',
  tag: 'backend',
  responsibleId: mockResponsibleId,
};

export const mockFindTasksDtoWithNormalization: FindTasksDto = {
  title: '  documentação  ',
  tag: ' backend ',
};

export const mockInvalidFindTasksDto = {
  responsibleId: 'invalid-uuid',
  status: 'INVALID_STATUS',
};

export const mockUpdateTaskStatusToInProgressDto: UpdateTaskStatusDto = {
  status: 'IN_PROGRESS',
};

export const mockUpdateTaskStatusToDoneDto: UpdateTaskStatusDto = {
  status: 'DONE',
};

export const mockUpdateTaskStatusToPausedDto: UpdateTaskStatusDto = {
  status: 'PAUSED',
};

export const mockUpdateTaskStatusToCancelledDto: UpdateTaskStatusDto = {
  status: 'CANCELLED',
};

export const mockInvalidUpdateTaskStatusDto = {
  status: 'INVALID_STATUS',
};

export const mockDeletedTaskResponse = {
  id: mockTaskId,
  message: 'Tarefa deletada com sucesso',
};

export const mockCreatedTask = {
  id: mockTaskId,
  title: 'Preparar documentação da API',
  description: 'Consolidar os endpoints do módulo de tarefas.',
  tags: ['backend', 'documentacao'],
  status: 'PENDING' as const,
  createdBy: 'John Doe',
  userId: mockTaskOwnerId,
  responsibleId: null,
  isActive: true,
};

export const mockCreatedTaskForOtherUser = {
  id: mockTaskId,
  title: 'Delegar revisão',
  description: null,
  tags: [],
  status: 'PENDING' as const,
  createdBy: 'Admin User',
  userId: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
  responsibleId: mockResponsibleId,
  isActive: true,
};

export const mockPendingTaskRecord = {
  id: mockTaskId,
  status: 'PENDING' as const,
  userId: mockTaskOwnerId,
  responsibleId: null,
  isActive: true,
  startedAt: null,
};

export const mockInProgressTaskRecord = {
  id: mockTaskId,
  status: 'IN_PROGRESS' as const,
  userId: mockTaskOwnerId,
  responsibleId: null,
  isActive: true,
  startedAt: new Date('2026-05-20T12:00:00.000Z'),
};

export const mockBlockedTaskRecord = {
  id: mockTaskId,
  status: 'BLOCKED' as const,
  userId: mockTaskOwnerId,
  responsibleId: mockResponsibleId,
  isActive: true,
  startedAt: new Date('2026-05-20T12:00:00.000Z'),
};

export const mockInactiveTaskRecord = {
  id: mockTaskId,
  status: 'PENDING' as const,
  userId: mockTaskOwnerId,
  isActive: false,
};

export const mockDoneTaskRecord = {
  id: mockTaskId,
  status: 'DONE' as const,
  userId: mockTaskOwnerId,
  isActive: true,
};
