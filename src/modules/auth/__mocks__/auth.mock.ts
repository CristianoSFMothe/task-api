import type { UserAuthResponse } from '@/modules/users/users.service';

import type { CreateAuthDto } from '../dto/create-auth.dto';

export const mockLoginDto: CreateAuthDto = {
  email: 'john@example.com',
  password: '123456',
};

export const mockLoginDtoWithNormalizedEmail: CreateAuthDto = {
  email: 'JOHN@EXAMPLE.COM',
  password: '123456',
};

export const mockInvalidEmailLoginDto: CreateAuthDto = {
  email: 'invalid-email',
  password: '123456',
};

export const mockNonRegisteredEmailLoginDto: CreateAuthDto = {
  email: 'jane@example.com',
  password: '123456',
};

export const mockWrongPasswordLoginDto: CreateAuthDto = {
  email: 'john@example.com',
  password: 'wrong-password',
};

export const mockAuthUser: UserAuthResponse = {
  id: '4a9d8f58-10fe-4af4-8f7d-f3c4f804d073',
  name: 'John Doe',
  email: 'john@example.com',
  password: 'hashed-password',
  role: 'USER',
  status: 'ACTIVE',
};

export const mockAccessToken = 'signed-token';

export const mockJwtPayload = {
  sub: mockAuthUser.id,
  email: mockAuthUser.email,
  role: mockAuthUser.role,
};

export const mockLoginResponse = {
  access_token: mockAccessToken,
  userId: mockAuthUser.id,
  name: mockAuthUser.name,
  email: mockAuthUser.email,
};

export const mockLogoutResponse = {
  message: 'Logout realizado com sucesso',
};
