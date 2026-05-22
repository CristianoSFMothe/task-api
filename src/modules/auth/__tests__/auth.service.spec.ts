import { NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ZodError } from 'zod';

import { messages } from '@/common/messages';
import {
  mockAccessToken,
  mockAuthUser,
  mockInvalidEmailLoginDto,
  mockJwtPayload,
  mockLoginDto,
  mockLoginDtoWithNormalizedEmail,
  mockLoginResponse,
  mockLogoutResponse,
  mockNonRegisteredEmailLoginDto,
  mockWrongPasswordLoginDto,
} from '@/modules/auth/__mocks__/auth.mock';
import type { CreateAuthDto } from '@/modules/auth/dto/create-auth.dto';
import { UsersService } from '@/modules/users/users.service';

import { AuthService } from '../auth.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

const loginNotFoundScenarios: [string, CreateAuthDto][] = [
  ['email not registered', mockNonRegisteredEmailLoginDto],
  ['incorrect email with correct password', mockNonRegisteredEmailLoginDto],
];

const invalidPasswordScenarios: [string, CreateAuthDto][] = [
  ['invalid password', mockWrongPasswordLoginDto],
  ['correct email but incorrect password', mockWrongPasswordLoginDto],
];

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
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return access token, userId, name and email on login', async () => {
    usersService.findAuthUserByEmail.mockResolvedValue(mockAuthUser);
    jwtService.signAsync.mockResolvedValue(mockAccessToken);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await expect(service.login(mockLoginDto)).resolves.toEqual(
      mockLoginResponse,
    );

    expect(jwtService.signAsync.mock.calls[0]?.[0]).toEqual(mockJwtPayload);
  });

  it('should return success message on logout', () => {
    expect(service.logout()).toEqual(mockLogoutResponse);
  });

  it('should normalize email before authenticating', async () => {
    usersService.findAuthUserByEmail.mockResolvedValue(mockAuthUser);
    jwtService.signAsync.mockResolvedValue(mockAccessToken);
    jest.mocked(bcrypt.compare).mockResolvedValue(true as never);

    await service.login(mockLoginDtoWithNormalizedEmail);

    expect(usersService.findAuthUserByEmail.mock.calls[0]?.[0]).toBe(
      'john@example.com',
    );
  });

  it('should reject login with invalid email format', async () => {
    await expect(
      service.login(mockInvalidEmailLoginDto),
    ).rejects.toBeInstanceOf(ZodError);

    expect(usersService.findAuthUserByEmail.mock.calls).toHaveLength(0);
    expect(jest.mocked(bcrypt.compare).mock.calls).toHaveLength(0);
    expect(jwtService.signAsync.mock.calls).toHaveLength(0);
  });

  it.each(loginNotFoundScenarios)(
    'should reject login when %s',
    async (_, loginDto) => {
      usersService.findAuthUserByEmail.mockRejectedValue(
        new NotFoundException(messages.user.notFound),
      );

      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: messages.auth.invalidCredentials,
      });

      expect(jest.mocked(bcrypt.compare).mock.calls).toHaveLength(0);
      expect(jwtService.signAsync.mock.calls).toHaveLength(0);
    },
  );

  it('should reject login for inactive user', async () => {
    usersService.findAuthUserByEmail.mockRejectedValue(
      new NotFoundException(messages.user.notFound),
    );

    await expect(service.login(mockLoginDto)).rejects.toMatchObject({
      message: messages.auth.invalidCredentials,
    });

    expect(jest.mocked(bcrypt.compare).mock.calls).toHaveLength(0);
    expect(jwtService.signAsync.mock.calls).toHaveLength(0);
  });

  it.each(invalidPasswordScenarios)(
    'should reject login with %s',
    async (_, loginDto) => {
      usersService.findAuthUserByEmail.mockResolvedValue(mockAuthUser);
      jest.mocked(bcrypt.compare).mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toMatchObject({
        message: messages.auth.invalidCredentials,
      });

      expect(jest.mocked(bcrypt.compare).mock.calls[0]).toEqual([
        loginDto.password,
        mockAuthUser.password,
      ]);
      expect(jwtService.signAsync.mock.calls).toHaveLength(0);
    },
  );

  it('should rethrow unexpected error from users service', async () => {
    const unexpectedError = new Error('database unavailable');

    usersService.findAuthUserByEmail.mockRejectedValue(unexpectedError);

    await expect(service.login(mockLoginDto)).rejects.toBe(unexpectedError);

    expect(jest.mocked(bcrypt.compare).mock.calls).toHaveLength(0);
    expect(jwtService.signAsync.mock.calls).toHaveLength(0);
  });
});
