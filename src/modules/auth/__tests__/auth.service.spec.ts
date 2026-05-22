import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';

import { UsersService } from '@/modules/users/users.service';

import { AuthService } from '../auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            findAuthUserByEmail: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return access token, userId, name and email on login', async () => {
    usersService.findAuthUserByEmail.mockResolvedValue({
      id: '4a9d8f58-10fe-4af4-8f7d-f3c4f804d073',
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
      role: 'USER',
      status: 'ACTIVE',
    });

    jwtService.signAsync.mockResolvedValue('signed-token');
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(
      service.login({
        email: 'john@example.com',
        password: '123456',
      }),
    ).resolves.toEqual({
      access_token: 'signed-token',
      userId: '4a9d8f58-10fe-4af4-8f7d-f3c4f804d073',
      name: 'John Doe',
      email: 'john@example.com',
    });

    expect(jwtService.signAsync.mock.calls[0]?.[0]).toEqual({
      sub: '4a9d8f58-10fe-4af4-8f7d-f3c4f804d073',
      email: 'john@example.com',
      role: 'USER',
    });
  });

  it('should return success message on logout', () => {
    expect(service.logout()).toEqual({
      message: 'Logout realizado com sucesso',
    });
  });
});
