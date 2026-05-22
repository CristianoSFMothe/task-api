import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ZodError } from 'zod';

import { messages } from '@/common/messages';
import {
  mockInvalidEmailLoginDto,
  mockLoginDto,
  mockLoginResponse,
  mockLogoutResponse,
  mockNonRegisteredEmailLoginDto,
  mockWrongPasswordLoginDto,
} from '@/modules/auth/__mocks__/auth.mock';

import { AuthController } from '../auth.controller';
import { AuthService } from '../auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { login: jest.Mock; logout: jest.Mock };

  beforeEach(async () => {
    authService = {
      login: jest.fn(),
      logout: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate login to auth service and return the login response', async () => {
    authService.login.mockResolvedValue(mockLoginResponse);

    await expect(controller.login(mockLoginDto)).resolves.toEqual(
      mockLoginResponse,
    );
    expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it('should propagate invalid email error on login', async () => {
    const error = new ZodError([
      {
        code: 'invalid_format',
        format: 'email',
        input: mockInvalidEmailLoginDto.email,
        message: messages.validation.emailInvalid,
        path: ['email'],
        pattern:
          "/^(?!\\.)(?!.*\\.\\.)([A-Za-z0-9_'+\\-\\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\\-]*\\.)+[A-Za-z]{2,}$/",
      },
    ]);

    authService.login.mockRejectedValue(error);

    await expect(controller.login(mockInvalidEmailLoginDto)).rejects.toBe(
      error,
    );
    expect(authService.login).toHaveBeenCalledWith(mockInvalidEmailLoginDto);
  });

  it.each([
    ['login with invalid password', mockWrongPasswordLoginDto],
    [
      'login with correct email but incorrect password',
      mockWrongPasswordLoginDto,
    ],
    ['login with inactive user', mockLoginDto],
    [
      'login with incorrect email and correct password',
      mockNonRegisteredEmailLoginDto,
    ],
    ['login with unregistered email', mockNonRegisteredEmailLoginDto],
  ])('should propagate unauthorized error for %s', async (_, loginDto) => {
    const error = new UnauthorizedException(messages.auth.invalidCredentials);

    authService.login.mockRejectedValue(error);

    await expect(controller.login(loginDto)).rejects.toBe(error);
    expect(authService.login).toHaveBeenCalledWith(loginDto);
    expect(authService.login).toHaveBeenCalledTimes(1);
  });

  it('should propagate unexpected error from auth service on login', async () => {
    const error = new Error('database unavailable');

    authService.login.mockRejectedValue(error);

    await expect(controller.login(mockLoginDto)).rejects.toBe(error);
    expect(authService.login).toHaveBeenCalledWith(mockLoginDto);
  });

  it('should delegate logout to auth service', () => {
    authService.logout.mockReturnValue(mockLogoutResponse);

    expect(controller.logout()).toEqual(mockLogoutResponse);
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });

  it('should propagate unexpected error from auth service on logout', () => {
    const error = new Error('logout failed');

    authService.logout.mockImplementation(() => {
      throw error;
    });

    expect(() => controller.logout()).toThrow(error);
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });
});
