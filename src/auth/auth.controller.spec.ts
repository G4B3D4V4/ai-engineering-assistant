import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller.js';
import { AuthService } from './auth.service.js';
import { authServiceMock } from '../../test/mocks/services/auth-service.mock.js';
import { mockUser } from '../../test/fixtures/users/user.fixture.js';
import { mockAccessToken, mockPassword } from '../../test/fixtures/auth/auth.fixture.js';
import { AuthenticatedRequest } from './interfaces/authenticated-request.interface.js';
import { ConflictException } from '@nestjs/common';

describe('AuthController', () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authServiceMock }],
    }).compile();

    controller = module.get<AuthController>(AuthController);

    vi.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should register user and return access token', async () => {
    const registerDto = {
      email: mockUser.email,
      password: mockPassword,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    };

    authServiceMock.register.mockResolvedValue({
      access_token: mockAccessToken,
    });

    const result = await controller.register(registerDto);

    expect(authServiceMock.register).toHaveBeenCalledWith(registerDto);

    expect(result).toStrictEqual({
      access_token: mockAccessToken,
    });
  });

  it('should throw conflict exception on register user', async () => {
    const registerDto = {
      email: mockUser.email,
      password: mockPassword,
      firstName: mockUser.firstName,
      lastName: mockUser.lastName,
    };

    authServiceMock.register.mockRejectedValueOnce(
      new ConflictException('User with this email already exists'),
    );

    await expect(controller.register(registerDto)).rejects.toThrow(
      'User with this email already exists',
    );
  });

  it('should login user and return access token', async () => {
    const loginDto = {
      email: mockUser.email,
      password: mockPassword,
    };

    const request = {
      user: mockUser,
    } as AuthenticatedRequest;

    authServiceMock.login.mockResolvedValue({
      access_token: mockAccessToken,
    });

    const result = await controller.login(loginDto, request);

    expect(authServiceMock.login).toHaveBeenCalledWith(mockUser);

    expect(result).toStrictEqual({
      access_token: mockAccessToken,
    });
  });
});
