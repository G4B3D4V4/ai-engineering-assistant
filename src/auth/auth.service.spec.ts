import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConflictException } from '@nestjs/common';
import { AuthService } from './auth.service.js';
import { UsersService } from '../users/users.service.js';
import { hashPassword, verifyPassword } from '../common/crypto/password.js';
import { mockUser, mockUserWithPassword } from '../../test/fixtures/users/user.fixture.js';
import {
  mockAccessToken,
  mockHashedPassword,
  mockPassword,
} from '../../test/fixtures/auth/auth.fixture.js';
import { jwtServiceMock } from '../../test/mocks/services/jwt-service.mock.js';
import { usersServiceMock } from '../../test/mocks/services/users-service.mock.js';

vi.mock('../common/crypto/password.js', () => ({
  hashPassword: vi.fn(),
  verifyPassword: vi.fn(),
}));

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersServiceMock },
        { provide: JwtService, useValue: jwtServiceMock },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('Register', () => {
    const registerDto = {
      email: mockUser.email,
      password: mockPassword,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    };
    it('should register user and return access token', async () => {
      vi.mocked(hashPassword).mockResolvedValue(mockHashedPassword);

      usersServiceMock.create.mockResolvedValue(mockUser);

      jwtServiceMock.signAsync.mockResolvedValue(mockAccessToken);

      const result = await service.register(registerDto);

      expect(hashPassword).toHaveBeenCalledWith(mockPassword);

      expect(usersServiceMock.create).toHaveBeenCalledWith({
        email: mockUser.email,
        password: mockHashedPassword,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });

      expect(result).toStrictEqual({
        access_token: mockAccessToken,
      });
    });

    it('should throw conflict exception on register user', async () => {
      vi.mocked(hashPassword).mockResolvedValue(mockHashedPassword);

      usersServiceMock.create.mockRejectedValueOnce(
        new ConflictException('User with this email already exists'),
      );

      await expect(service.register(registerDto)).rejects.toThrow(
        'User with this email already exists',
      );
    });
  });

  describe('Validate', () => {
    it('should return null on validate user when user does not exists', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(null);

      const result = await service.validateUser(mockUserWithPassword.email, mockPassword);

      expect(result).toBeNull();
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(mockUserWithPassword.email);
      expect(verifyPassword).not.toHaveBeenCalled();
    });

    it('should return null on validate user when password is wrong', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUserWithPassword);

      vi.mocked(verifyPassword).mockResolvedValue(false);

      const result = await service.validateUser(mockUserWithPassword.email, mockPassword);

      expect(result).toBeNull();
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(mockUserWithPassword.email);
      expect(verifyPassword).toHaveBeenCalledWith(mockUserWithPassword.password, mockPassword);
    });

    it('should return user on success validate user', async () => {
      usersServiceMock.findByEmail.mockResolvedValue(mockUserWithPassword);

      vi.mocked(verifyPassword).mockResolvedValue(true);

      const result = await service.validateUser(mockUserWithPassword.email, mockPassword);

      expect(result).toStrictEqual(mockUser);
      expect(usersServiceMock.findByEmail).toHaveBeenCalledWith(mockUserWithPassword.email);
      expect(verifyPassword).toHaveBeenCalledWith(mockUserWithPassword.password, mockPassword);
    });
  });

  describe('Login', () => {
    it('should return access token on login', async () => {
      jwtServiceMock.signAsync.mockResolvedValue(mockAccessToken);

      const result = await service.login(mockUser);

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });

      expect(result).toStrictEqual({
        access_token: mockAccessToken,
      });
    });
  });
});
