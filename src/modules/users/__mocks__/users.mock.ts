import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import type { CreateUserDto } from '../dto/create-user.dto';
import type { FindUserByEmailDto } from '../dto/find-user-by-email.dto';
import type { FindUserByNameDto } from '../dto/find-user-by-name.dto';
import type { SearchUsersDto } from '../dto/search-users.dto';
import type { UpdateNameUserDto } from '../dto/update-name-user.dto';
import type { UserAuthResponse } from '../users.service';

export const mockUserId = '6f0506ab-70d3-4aab-bec9-6bd22fba8a66';
export const mockInactiveUserId = '6f0506ab-70d3-4aab-bec9-6bd22fba8a67';
export const mockMissingUserId = '6f0506ab-70d3-4aab-bec9-6bd22fba8a68';

export const mockCreateUserDto: CreateUserDto = {
  name: 'John Doe',
  email: 'john@example.com',
  password: '123456',
};

export const mockCreateUserDtoWithNormalization: CreateUserDto = {
  name: '  John Doe  ',
  email: 'JOHN@EXAMPLE.COM',
  password: '123456',
};

export const mockInvalidCreateUserDto: CreateUserDto = {
  name: 'J',
  email: 'invalid-email',
  password: '123',
};

export const mockFindUserByEmailDto: FindUserByEmailDto = {
  email: 'john@example.com',
};

export const mockFindUserByName = 'john';

export const mockFindUserByNameDto: FindUserByNameDto = {
  name: 'John Doe',
};

export const mockFindUserByNameDtoWithNormalization: FindUserByNameDto = {
  name: '  John Doe  ',
};

export const mockSearchUsersByEmailDto: SearchUsersDto = {
  email: 'john@example.com',
};

export const mockSearchUsersByNameDto: SearchUsersDto = {
  name: 'John Doe',
};

export const mockSearchUsersByNameAndEmailDto: SearchUsersDto = {
  name: 'John Doe',
  email: 'john@example.com',
};

export const mockSearchUsersWithNormalizationDto: SearchUsersDto = {
  name: '  John Doe  ',
  email: 'JOHN@EXAMPLE.COM',
};

export const mockEmptySearchUsersDto: SearchUsersDto = {};

export const mockUpdateNameUserDto: UpdateNameUserDto = {
  name: 'Johnny Doe',
};

export const mockUpdateNameUserDtoWithNormalization: UpdateNameUserDto = {
  name: '  Johnny Doe  ',
};

export const mockInvalidUpdateNameUserDto: UpdateNameUserDto = {
  name: '',
};

export const mockUser = {
  id: mockUserId,
  name: 'John Doe',
  email: 'john@example.com',
};

export const mockUserTask = {
  id: '8f0506ab-70d3-4aab-bec9-6bd22fba8a70',
  title: 'Preparar documentação da API',
  description: 'Consolidar os endpoints do módulo de tarefas.',
  tags: ['backend', 'documentacao'],
  status: 'PENDING' as const,
  createdBy: 'John Doe',
  userId: mockUserId,
  responsibleId: null,
};

export const mockSecondUserTask = {
  id: '9f0506ab-70d3-4aab-bec9-6bd22fba8a71',
  title: 'Revisar payloads',
  description: null,
  tags: ['review'],
  status: 'IN_PROGRESS' as const,
  createdBy: 'Jane Doe',
  userId: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
  responsibleId: mockUserId,
};

export const mockUserWithStatus = {
  ...mockUser,
  status: 'ACTIVE' as const,
};

export const mockInactiveUserWithStatus = {
  id: mockInactiveUserId,
  name: 'John Inactive',
  email: 'inactive@example.com',
  status: 'INACTIVE' as const,
};

export const mockUserWithRole = {
  ...mockUser,
  role: 'USER' as const,
};

export const mockUserWithTasks = {
  ...mockUser,
  tasks: [mockUserTask],
};

export const mockUserWithNoTasks = {
  ...mockUser,
  tasks: [],
};

export const mockUserWithRoleAndTasks = {
  ...mockUserWithRole,
  tasks: [mockUserTask],
};

export const mockUserWithStatusAndRole = {
  ...mockUserWithRole,
  status: 'ACTIVE' as const,
};

export const mockInactiveUserWithStatusAndRole = {
  id: mockInactiveUserId,
  name: 'John Inactive',
  email: 'inactive@example.com',
  role: 'USER' as const,
  status: 'INACTIVE' as const,
};

export const mockUserAuthResponse: UserAuthResponse = {
  ...mockUserWithStatusAndRole,
  password: 'hashed-password',
};

export const mockUsersList = [
  mockUser,
  {
    id: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
    name: 'Jane Doe',
    email: 'jane@example.com',
  },
];

export const mockUsersListWithTasks = [
  mockUserWithTasks,
  {
    id: '7f0506ab-70d3-4aab-bec9-6bd22fba8a69',
    name: 'Jane Doe',
    email: 'jane@example.com',
    tasks: [mockSecondUserTask],
  },
];

export const mockDeletedUserResponse = {
  id: mockUserId,
  message: 'Usuário deletado com sucesso',
};

export const mockUpdatedStatusResponse = {
  id: mockInactiveUserId,
  message: 'Status do usuário atualizado com sucesso',
};

export const mockAlreadyActiveResponse = {
  id: mockUserId,
  message: 'Usuário já está ativo',
};

export const mockAuthenticatedRequest = {
  user: {
    userId: mockUserId,
    email: mockUser.email,
    name: mockUser.name,
    role: 'USER',
  },
} as RequestWithUser;
