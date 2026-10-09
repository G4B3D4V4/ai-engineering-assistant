import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { DatabaseService } from '../database/database.service.js';
import { databaseServiceMock } from '../../test/mocks/services/database-service.mock.js';
import { mockUser, mockUserWithPassword } from '../../test/fixtures/users/user.fixture.js';
import { mockHashedPassword } from '../../test/fixtures/auth/auth.fixture.js';
import { Prisma } from '../generated/prisma/client.js';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: DatabaseService, useValue: databaseServiceMock }],
    }).compile();

    service = module.get<UsersService>(UsersService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createDto = {
      email: mockUser.email,
      password: mockHashedPassword,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    };
    it('should create and return user', async () => {
      databaseServiceMock.user.create.mockResolvedValue(mockUser);

      const result = await service.create(createDto);

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        data: createDto,
      });

      expect(result).toStrictEqual(mockUser);
    });

    it('should throw ConflictException when email already exists', async () => {
      const prismaError = new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.10.0',
      });
      databaseServiceMock.user.create.mockRejectedValue(prismaError);

      const promise = service.create(createDto);

      await expect(promise).rejects.toThrow(ConflictException);
      await expect(promise).rejects.toThrow('User with this email already exists');

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        data: createDto,
      });
    });

    it('should rethrow unknown error', async () => {
      const unknownError = new Error('Something went wrong');

      databaseServiceMock.user.create.mockRejectedValue(unknownError);

      const promise = service.create(createDto);

      await expect(promise).rejects.toBe(unknownError);
      await expect(promise).rejects.toThrow('Something went wrong');

      expect(databaseServiceMock.user.create).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        data: createDto,
      });
    });
  });

  describe('findById', () => {
    it('should return user by id', async () => {
      databaseServiceMock.user.findUnique.mockResolvedValue(mockUser);
      const result = await service.findById(1);

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
        },
        where: { id: 1 },
      });

      expect(result).toStrictEqual(mockUser);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      databaseServiceMock.user.findUnique.mockResolvedValue(null);

      const promise = service.findById(1);

      await expect(promise).rejects.toThrow(NotFoundException);
      await expect(promise).rejects.toThrow('User not found');
    });
  });

  describe('findByEmail', () => {
    it('should return user by email', async () => {
      databaseServiceMock.user.findUnique.mockResolvedValue(mockUserWithPassword);
      const result = await service.findByEmail('john_doe@example.com');

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          password: true,
        },
        where: { email: 'john_doe@example.com' },
      });

      expect(result).toStrictEqual(mockUserWithPassword);
    });

    it('should return null when user does not exist', async () => {
      databaseServiceMock.user.findUnique.mockResolvedValue(null);
      const result = await service.findByEmail('john_doe@example.com');

      expect(databaseServiceMock.user.findUnique).toHaveBeenCalledWith({
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          password: true,
        },
        where: { email: 'john_doe@example.com' },
      });

      expect(result).toBe(null);
    });
  });
});
