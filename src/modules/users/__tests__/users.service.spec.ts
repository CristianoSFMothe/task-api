import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { ZodError } from 'zod';

import { messages } from '@/common/messages';
import { DATABASE_TOKEN } from '@/database/database.provider';
import {
  mockAlreadyActiveResponse,
  mockCreateUserDto,
  mockCreateUserDtoWithNormalization,
  mockDeletedUserResponse,
  mockEmptySearchUsersDto,
  mockFindUserByName,
  mockFindUserByNameWithNormalization,
  mockInactiveUserId,
  mockInactiveUserWithStatus,
  mockInactiveUserWithStatusAndRole,
  mockInvalidCreateUserDto,
  mockInvalidUpdateNameUserDto,
  mockMissingUserId,
  mockSearchUsersByEmailDto,
  mockSearchUsersByNameAndEmailDto,
  mockSearchUsersByNameDto,
  mockSearchUsersWithNormalizationDto,
  mockSecondUserTask,
  mockUpdatedStatusResponse,
  mockUpdateNameUserDto,
  mockUpdateNameUserDtoWithNormalization,
  mockUser,
  mockUserAuthResponse,
  mockUsersList,
  mockUsersListWithTasks,
  mockUserTask,
  mockUserWithNoTasks,
  mockUserWithRoleAndTasks,
  mockUserWithStatus,
  mockUserWithStatusAndRole,
  mockUserWithTasks,
} from '@/modules/users/__mocks__/users.mock';

import { UsersService } from '../users.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
}));

type UserWithStatusRecord = {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'INACTIVE';
};

type AuthUserRecord = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE';
};

const findByIdNotFoundScenarios: [string, UserWithStatusRecord | undefined][] =
  [
    ['missing user', undefined],
    ['inactive user', mockInactiveUserWithStatus],
  ];

const findByEmailNotFoundScenarios: [
  string,
  UserWithStatusRecord | undefined,
][] = [
  ['missing user', undefined],
  ['inactive user', mockInactiveUserWithStatus],
];

const findAuthByEmailNotFoundScenarios: [string, AuthUserRecord | undefined][] =
  [
    ['missing user', undefined],
    [
      'inactive user',
      {
        ...mockUserAuthResponse,
        status: 'INACTIVE',
      },
    ],
  ];

type MockDb = {
  query: {
    tasks: {
      findMany: jest.Mock;
    };
    users: {
      findFirst: jest.Mock;
      findMany: jest.Mock;
    };
  };
  insert: jest.Mock;
  update: jest.Mock;
};

describe('UsersService', () => {
  let service: UsersService;
  let db: MockDb;
  let insertValuesMock: jest.Mock;
  let insertReturningMock: jest.Mock;
  let updateSetMock: jest.Mock;
  let updateWhereMock: jest.Mock;
  let updateReturningMock: jest.Mock;

  beforeEach(async () => {
    insertReturningMock = jest.fn();
    insertValuesMock = jest.fn(() => ({
      returning: insertReturningMock,
    }));

    updateReturningMock = jest.fn();
    updateWhereMock = jest.fn(() => ({
      returning: updateReturningMock,
    }));
    updateSetMock = jest.fn(() => ({
      where: updateWhereMock,
    }));

    db = {
      query: {
        tasks: {
          findMany: jest.fn(),
        },
        users: {
          findFirst: jest.fn(),
          findMany: jest.fn(),
        },
      },
      insert: jest.fn(() => ({
        values: insertValuesMock,
      })),
      update: jest.fn(() => ({
        set: updateSetMock,
      })),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: DATABASE_TOKEN,
          useValue: db,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a user with normalized data', async () => {
    db.query.users.findFirst.mockResolvedValue(undefined);
    jest.mocked(bcrypt.hash).mockResolvedValue('hashed-password' as never);
    insertReturningMock.mockResolvedValue([mockUser]);

    await expect(
      service.create(mockCreateUserDtoWithNormalization),
    ).resolves.toEqual(mockUser);

    expect(jest.mocked(bcrypt.hash)).toHaveBeenCalledWith('123456', 10);
    expect(insertValuesMock).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'hashed-password',
    });
  });

  it('should reject create when dto is invalid', async () => {
    await expect(
      service.create(mockInvalidCreateUserDto),
    ).rejects.toBeInstanceOf(ZodError);

    expect(db.query.users.findFirst.mock.calls).toHaveLength(0);
    expect(jest.mocked(bcrypt.hash).mock.calls).toHaveLength(0);
    expect(db.insert.mock.calls).toHaveLength(0);
  });

  it('should reject create when email is already registered', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);

    await expect(service.create(mockCreateUserDto)).rejects.toMatchObject({
      message: messages.user.emailAlreadyRegistered,
    });

    expect(jest.mocked(bcrypt.hash).mock.calls).toHaveLength(0);
    expect(db.insert.mock.calls).toHaveLength(0);
  });

  it('should return active users on findAll', async () => {
    db.query.users.findMany.mockResolvedValue(mockUsersList);
    db.query.tasks.findMany.mockResolvedValue([
      mockUserTask,
      mockSecondUserTask,
    ]);

    await expect(service.findAll()).resolves.toEqual(mockUsersListWithTasks);

    expect(db.query.users.findMany.mock.calls).toHaveLength(1);
    expect(db.query.tasks.findMany.mock.calls).toHaveLength(1);
  });

  it('should attach an empty task list for active users without created tasks', async () => {
    db.query.users.findMany.mockResolvedValue(mockUsersList);
    db.query.tasks.findMany.mockResolvedValue([mockUserTask]);

    await expect(service.findAll()).resolves.toEqual([
      mockUserWithTasks,
      {
        ...mockUsersList[1],
        tasks: [],
      },
    ]);
  });

  it('should return an empty array on findAll when there are no active users', async () => {
    db.query.users.findMany.mockResolvedValue([]);

    await expect(service.findAll()).resolves.toEqual([]);

    expect(db.query.tasks.findMany).not.toHaveBeenCalled();
  });

  it('should return user by id', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);
    db.query.tasks.findMany.mockResolvedValue([mockUserTask]);

    await expect(service.findById(mockUser.id)).resolves.toEqual(
      mockUserWithTasks,
    );

    expect(db.query.users.findFirst.mock.calls).toHaveLength(1);
    expect(db.query.tasks.findMany.mock.calls).toHaveLength(1);
  });

  it('should return user by id even when there are no tasks', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);
    db.query.tasks.findMany.mockResolvedValue([]);

    await expect(service.findById(mockUser.id)).resolves.toEqual(
      mockUserWithNoTasks,
    );
  });

  it('should return user by id with role when requested', async () => {
    db.query.users.findFirst
      .mockResolvedValueOnce(mockUserWithStatus)
      .mockResolvedValueOnce(mockUserWithStatusAndRole);
    db.query.tasks.findMany.mockResolvedValue([mockUserTask]);

    await expect(
      service.findById(mockUser.id, { includeRole: true }),
    ).resolves.toEqual(mockUserWithRoleAndTasks);

    expect(db.query.users.findFirst.mock.calls).toHaveLength(2);
    expect(db.query.tasks.findMany.mock.calls).toHaveLength(1);
  });

  it.each(findByIdNotFoundScenarios)(
    'should reject findById for %s',
    async (_, userRecord) => {
      db.query.users.findFirst.mockResolvedValue(userRecord);

      await expect(service.findById(mockMissingUserId)).rejects.toMatchObject({
        message: messages.user.notFound,
      });
    },
  );

  it('should reject findById with role when role lookup is missing or inactive', async () => {
    db.query.users.findFirst
      .mockResolvedValueOnce(mockUserWithStatus)
      .mockResolvedValueOnce(mockInactiveUserWithStatusAndRole);

    await expect(
      service.findById(mockUser.id, { includeRole: true }),
    ).rejects.toMatchObject({
      message: messages.user.notFound,
    });
  });

  it('should reject findById with role when role lookup is missing', async () => {
    db.query.users.findFirst
      .mockResolvedValueOnce(mockUserWithStatus)
      .mockResolvedValueOnce(undefined);

    await expect(
      service.findById(mockUser.id, { includeRole: true }),
    ).rejects.toMatchObject({
      message: messages.user.notFound,
    });
  });

  it('should return user by email', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);
    db.query.tasks.findMany.mockResolvedValue([mockUserTask]);

    await expect(service.findByEmail(mockUser.email)).resolves.toEqual(
      mockUserWithTasks,
    );
  });

  it.each(findByEmailNotFoundScenarios)(
    'should reject findByEmail for %s',
    async (_, userRecord) => {
      db.query.users.findFirst.mockResolvedValue(userRecord);

      await expect(service.findByEmail(mockUser.email)).rejects.toMatchObject({
        message: messages.user.notFound,
      });
    },
  );

  it('should return user by email even when no tasks are found', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);
    db.query.tasks.findMany.mockResolvedValue([]);

    await expect(service.findByEmail(mockUser.email)).resolves.toEqual(
      mockUserWithNoTasks,
    );
  });

  it('should search users by email', async () => {
    db.query.users.findMany.mockResolvedValue([mockUser]);
    db.query.tasks.findMany.mockResolvedValue([mockUserTask]);

    await expect(
      service.searchUsers(mockSearchUsersByEmailDto),
    ).resolves.toEqual([mockUserWithTasks]);

    expect(db.query.users.findMany).toHaveBeenCalledTimes(1);
    expect(db.query.tasks.findMany).toHaveBeenCalledTimes(1);
  });

  it('should search users by name', async () => {
    db.query.users.findMany.mockResolvedValue(mockUsersList);
    db.query.tasks.findMany.mockResolvedValue([
      mockUserTask,
      mockSecondUserTask,
    ]);

    await expect(
      service.searchUsers(mockSearchUsersByNameDto),
    ).resolves.toEqual(mockUsersListWithTasks);
  });

  it('should search users by name and email', async () => {
    db.query.users.findMany.mockResolvedValue([mockUser]);
    db.query.tasks.findMany.mockResolvedValue([mockUserTask]);

    await expect(
      service.searchUsers(mockSearchUsersByNameAndEmailDto),
    ).resolves.toEqual([mockUserWithTasks]);
  });

  it('should normalize filters before searching users', async () => {
    db.query.users.findMany.mockResolvedValue([mockUser]);
    db.query.tasks.findMany.mockResolvedValue([mockUserTask]);

    await expect(
      service.searchUsers(mockSearchUsersWithNormalizationDto),
    ).resolves.toEqual([mockUserWithTasks]);
  });

  it('should return an empty list when search finds no users', async () => {
    db.query.users.findMany.mockResolvedValue([]);

    await expect(
      service.searchUsers(mockSearchUsersByEmailDto),
    ).resolves.toEqual([]);

    expect(db.query.tasks.findMany).not.toHaveBeenCalled();
  });

  it('should reject searchUsers when no filter is provided', async () => {
    await expect(
      service.searchUsers(mockEmptySearchUsersDto),
    ).rejects.toBeInstanceOf(ZodError);

    expect(db.query.users.findMany).not.toHaveBeenCalled();
  });

  it('should return users by name', async () => {
    db.query.users.findMany.mockResolvedValue(mockUsersList);
    db.query.tasks.findMany.mockResolvedValue([
      mockUserTask,
      mockSecondUserTask,
    ]);

    await expect(service.findByName(mockFindUserByName)).resolves.toEqual(
      mockUsersListWithTasks,
    );

    expect(db.query.users.findMany.mock.calls).toHaveLength(1);
    expect(db.query.tasks.findMany.mock.calls).toHaveLength(1);
  });

  it('should reject findByName when no active users are found', async () => {
    db.query.users.findMany.mockResolvedValue([]);

    await expect(service.findByName(mockFindUserByName)).rejects.toMatchObject({
      message: messages.user.notFound,
    });
  });

  it('should normalize name before searching on findByName', async () => {
    db.query.users.findMany.mockResolvedValue(mockUsersList);
    db.query.tasks.findMany.mockResolvedValue([
      mockUserTask,
      mockSecondUserTask,
    ]);

    await expect(
      service.findByName(mockFindUserByNameWithNormalization),
    ).resolves.toEqual(mockUsersListWithTasks);

    expect(db.query.users.findMany).toHaveBeenCalledTimes(1);
  });

  it('should reject findByName when input is invalid', async () => {
    await expect(service.findByName(' ')).rejects.toBeInstanceOf(ZodError);

    expect(db.query.users.findMany).not.toHaveBeenCalled();
    expect(db.query.tasks.findMany).not.toHaveBeenCalled();
  });

  it('should return auth user by email', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserAuthResponse);

    await expect(service.findAuthUserByEmail(mockUser.email)).resolves.toEqual(
      mockUserAuthResponse,
    );
  });

  it.each(findAuthByEmailNotFoundScenarios)(
    'should reject findAuthUserByEmail for %s',
    async (_, userRecord) => {
      db.query.users.findFirst.mockResolvedValue(userRecord);

      await expect(
        service.findAuthUserByEmail(mockUser.email),
      ).rejects.toMatchObject({
        message: messages.user.notFound,
      });
    },
  );

  it('should update user name', async () => {
    updateReturningMock.mockResolvedValue([
      {
        ...mockUser,
        name: mockUpdateNameUserDto.name,
      },
    ]);

    await expect(
      service.updateName(mockUser.id, mockUpdateNameUserDto),
    ).resolves.toEqual({
      ...mockUser,
      name: mockUpdateNameUserDto.name,
    });

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        name: string;
        updatedAt: Date;
      },
    ];

    expect(updatePayload.name).toBe(mockUpdateNameUserDto.name);
    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
  });

  it('should normalize user name before updating', async () => {
    updateReturningMock.mockResolvedValue([
      {
        ...mockUser,
        name: 'Johnny Doe',
      },
    ]);

    await expect(
      service.updateName(mockUser.id, mockUpdateNameUserDtoWithNormalization),
    ).resolves.toEqual({
      ...mockUser,
      name: 'Johnny Doe',
    });

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        name: string;
        updatedAt: Date;
      },
    ];

    expect(updatePayload.name).toBe('Johnny Doe');
    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
  });

  it('should reject updateName when dto is invalid', async () => {
    await expect(
      service.updateName(mockUser.id, mockInvalidUpdateNameUserDto),
    ).rejects.toBeInstanceOf(ZodError);

    expect(db.update.mock.calls).toHaveLength(0);
  });

  it('should reject updateName when user is not found', async () => {
    updateReturningMock.mockResolvedValue([]);

    await expect(
      service.updateName(mockUser.id, mockUpdateNameUserDto),
    ).rejects.toMatchObject({
      message: messages.user.notFound,
    });
  });

  it('should delete user', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);
    updateReturningMock.mockResolvedValue([{ id: mockUser.id }]);

    await expect(service.delete(mockUser.id)).resolves.toEqual(
      mockDeletedUserResponse,
    );

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        status: 'INACTIVE';
        updatedAt: Date;
      },
    ];

    expect(updatePayload.status).toBe('INACTIVE');
    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
  });

  it('should reject delete when user does not exist', async () => {
    db.query.users.findFirst.mockResolvedValue(undefined);

    await expect(service.delete(mockMissingUserId)).rejects.toMatchObject({
      message: messages.user.notFound,
    });

    expect(db.update.mock.calls).toHaveLength(0);
  });

  it('should reject delete when user is inactive', async () => {
    db.query.users.findFirst.mockResolvedValue(mockInactiveUserWithStatus);

    await expect(service.delete(mockInactiveUserId)).rejects.toMatchObject({
      message: messages.user.notFound,
    });

    expect(db.update.mock.calls).toHaveLength(0);
  });

  it('should reject delete when update returns no user', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);
    updateReturningMock.mockResolvedValue([]);

    await expect(service.delete(mockUser.id)).rejects.toMatchObject({
      message: messages.user.notFound,
    });
  });

  it('should return already active response on updateStatus for active user', async () => {
    db.query.users.findFirst.mockResolvedValue(mockUserWithStatus);

    await expect(service.updateStatus(mockUser.id)).resolves.toEqual(
      mockAlreadyActiveResponse,
    );

    expect(db.update.mock.calls).toHaveLength(0);
  });

  it('should reactivate inactive user on updateStatus', async () => {
    db.query.users.findFirst
      .mockResolvedValueOnce(mockInactiveUserWithStatus)
      .mockResolvedValueOnce(mockInactiveUserWithStatus);
    updateReturningMock.mockResolvedValue([{ id: mockInactiveUserId }]);

    await expect(service.updateStatus(mockInactiveUserId)).resolves.toEqual(
      mockUpdatedStatusResponse,
    );

    const [updatePayload] = updateSetMock.mock.calls[0] as [
      {
        status: 'ACTIVE';
        updatedAt: Date;
      },
    ];

    expect(updatePayload.status).toBe('ACTIVE');
    expect(updatePayload.updatedAt).toBeInstanceOf(Date);
  });

  it('should reject updateStatus when reactivation update returns no user', async () => {
    db.query.users.findFirst
      .mockResolvedValueOnce(mockInactiveUserWithStatus)
      .mockResolvedValueOnce(mockInactiveUserWithStatus);
    updateReturningMock.mockResolvedValue([]);

    await expect(
      service.updateStatus(mockInactiveUserId),
    ).rejects.toMatchObject({
      message: messages.user.notFound,
    });
  });

  it('should reject updateStatus when user does not exist', async () => {
    db.query.users.findFirst.mockResolvedValue(undefined);

    await expect(service.updateStatus(mockMissingUserId)).rejects.toMatchObject(
      {
        message: messages.user.notFound,
      },
    );
  });

  it('should rethrow unexpected error on updateStatus', async () => {
    const unexpectedError = new Error('database unavailable');

    db.query.users.findFirst.mockRejectedValue(unexpectedError);

    await expect(service.updateStatus(mockUser.id)).rejects.toBe(
      unexpectedError,
    );
  });
});
