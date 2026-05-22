import { Test, TestingModule } from '@nestjs/testing';

import type { RequestWithUser } from '@/modules/auth/types/authenticated-user';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    findById: jest.Mock;
    updateName: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      findById: jest.fn(),
      updateName: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: usersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should use authenticated user id on findMe', () => {
    const request = {
      user: {
        userId: '6f0506ab-70d3-4aab-bec9-6bd22fba8a66',
        email: 'john@example.com',
        name: 'John',
        role: 'USER',
      },
    } as RequestWithUser;

    void controller.findMe(request);

    expect(usersService.findById).toHaveBeenCalledWith(
      '6f0506ab-70d3-4aab-bec9-6bd22fba8a66',
    );
  });

  it('should use authenticated user id on updateMyName', () => {
    const request = {
      user: {
        userId: '6f0506ab-70d3-4aab-bec9-6bd22fba8a66',
        email: 'john@example.com',
        name: 'John',
        role: 'USER',
      },
    } as RequestWithUser;

    void controller.updateMyName(request, {
      name: 'Johnny Doe',
    });

    expect(usersService.updateName).toHaveBeenCalledWith(
      '6f0506ab-70d3-4aab-bec9-6bd22fba8a66',
      {
        name: 'Johnny Doe',
      },
    );
  });
});
