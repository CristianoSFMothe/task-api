import { Test, TestingModule } from '@nestjs/testing';

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

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate logout to auth service', () => {
    authService.logout.mockReturnValue({
      message: 'Logout realizado com sucesso',
    });

    expect(controller.logout()).toEqual({
      message: 'Logout realizado com sucesso',
    });
    expect(authService.logout).toHaveBeenCalledTimes(1);
  });
});
