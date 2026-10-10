import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { hashPassword, verifyPassword } from '../common/crypto/password.js';
import { UserResponse } from '../users/dto/responses/user-response.dto.js';
import { UsersService } from '../users/users.service.js';
import { RegisterDto } from './dto/register.dto.js';
import { AccessTokenResponse } from './dto/responses/access-token-response.dto.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto): Promise<AccessTokenResponse> {
    const hashedPassword = await hashPassword(dto.password);
    const createdUser = await this.usersService.create({ ...dto, password: hashedPassword });

    return this.login(createdUser);
  }

  async validateUser(email: string, password: string): Promise<UserResponse | null> {
    const user = await this.usersService.findByEmail(email);

    if (!user) return null;

    const isPasswordValid = await verifyPassword(user.password, password);

    if (!isPasswordValid) return null;

    const { password: _, ...result } = user;

    return result;
  }

  async login(user: UserResponse): Promise<AccessTokenResponse> {
    const payload = {
      sub: user.id,
      email: user.email,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return { access_token: accessToken };
  }
}
