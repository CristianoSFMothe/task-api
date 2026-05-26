import { Test, TestingModule } from '@nestjs/testing';

import { messages } from '@/common/messages';
import {
  mockAlreadyActiveResponse,
  mockAuthenticatedRequest,
  mockCreateUserDto,
  mockDeletedUserResponse,
  mockSearchUsersByNameAndEmailDto,
  mockUpdatedStatusResponse,
  mockUpdateNameUserDto,
  mockUser,
  mockUsersList,
} from '@/modules/users/__mocks__/users.mock';

import { UsersController } from '../users.controller';
import { UsersService } from '../users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: {
    create: jest.Mock;
    findAll: jest.Mock;
    searchUsers: jest.Mock;
    findById: jest.Mock;
    updateName: jest.Mock;
    updateStatus: jest.Mock;
    delete: jest.Mock;
  };

  beforeEach(async () => {
    usersService = {
      create: jest.fn(),
      findAll: jest.fn(),
      searchUsers: jest.fn(),
      findById: jest.fn(),
      updateName: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should delegate create to users service', async () => {
    usersService.create.mockResolvedValue(mockUser);

    await expect(controller.create(mockCreateUserDto)).resolves.toEqual(
      mockUser,
    );
    expect(usersService.create).toHaveBeenCalledWith(mockCreateUserDto);
  });

  it('should delegate findAll to users service', async () => {
    usersService.findAll.mockResolvedValue(mockUsersList);

    await expect(controller.findAll()).resolves.toEqual(mockUsersList);
    expect(usersService.findAll.mock.calls).toHaveLength(1);
  });

  it('should delegate searchUsers to users service', async () => {
    usersService.searchUsers.mockResolvedValue(mockUsersList);

    await expect(
      controller.searchUsers(mockSearchUsersByNameAndEmailDto),
    ).resolves.toEqual(mockUsersList);
    expect(usersService.searchUsers).toHaveBeenCalledWith(
      mockSearchUsersByNameAndEmailDto,
    );
  });

  it('should delegate findMe using authenticated user id', async () => {
    usersService.findById.mockResolvedValue(mockUser);

    await expect(controller.findMe(mockAuthenticatedRequest)).resolves.toEqual(
      mockUser,
    );
    expect(usersService.findById).toHaveBeenCalledWith(
      mockAuthenticatedRequest.user.userId,
    );
  });

  it('should delegate updateMyName using authenticated user id', async () => {
    const updatedUser = {
      ...mockUser,
      name: mockUpdateNameUserDto.name,
    };

    usersService.updateName.mockResolvedValue(updatedUser);

    await expect(
      controller.updateMyName(mockAuthenticatedRequest, mockUpdateNameUserDto),
    ).resolves.toEqual(updatedUser);
    expect(usersService.updateName).toHaveBeenCalledWith(
      mockAuthenticatedRequest.user.userId,
      mockUpdateNameUserDto,
    );
  });

  it('should delegate updateStatus to users service', async () => {
    usersService.updateStatus.mockResolvedValue(mockUpdatedStatusResponse);

    await expect(
      controller.updateStatus(mockUpdatedStatusResponse.id),
    ).resolves.toEqual(mockUpdatedStatusResponse);
    expect(usersService.updateStatus).toHaveBeenCalledWith(
      mockUpdatedStatusResponse.id,
    );
  });

  it('should delegate delete to users service', async () => {
    usersService.delete.mockResolvedValue(mockDeletedUserResponse);

    await expect(
      controller.delete(mockDeletedUserResponse.id),
    ).resolves.toEqual(mockDeletedUserResponse);
    expect(usersService.delete).toHaveBeenCalledWith(
      mockDeletedUserResponse.id,
    );
  });

  it('should propagate unexpected error from users service', async () => {
    const error = new Error(messages.user.notFound);

    usersService.create.mockRejectedValue(error);

    await expect(controller.create(mockCreateUserDto)).rejects.toBe(error);
  });

  it('should return already active response from updateStatus', async () => {
    usersService.updateStatus.mockResolvedValue(mockAlreadyActiveResponse);

    await expect(
      controller.updateStatus(mockAlreadyActiveResponse.id),
    ).resolves.toEqual(mockAlreadyActiveResponse);
  });
});
