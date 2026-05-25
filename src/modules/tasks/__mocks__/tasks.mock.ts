import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import type { CreateTaskDto } from '../dto/create-task.dto';

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

export const mockInvalidCreateTaskDto: CreateTaskDto = {
  title: '   ',
  responsibleEmail: 'invalid-email',
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
};
