import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { AccessTokenResponse } from './dto/responses/access-token-response.dto.js';
import { LocalAuthGuard } from './guards/local-auth.guard.js';
import { LoginDto } from './dto/login.dto.js';
import { type LocalAuthenticatedRequest } from './interfaces/authenticated-request.interface.js';
import { RegisterDto } from './dto/register.dto.js';
import { AUTH_API_MESSAGES } from '../common/consts/message.constants.js';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Create account in system' })
  @ApiCreatedResponse({
    description: 'jwt token',
    type: AccessTokenResponse,
  })
  @ApiConflictResponse({ description: AUTH_API_MESSAGES.USER_EXISTS })
  @Post('register')
  async register(@Body() body: RegisterDto): Promise<AccessTokenResponse> {
    return await this.authService.register(body);
  }

  @ApiOperation({ summary: 'Login. Public(token is not required).' })
  @ApiCreatedResponse({
    description: 'jwt token',
    type: AccessTokenResponse,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Body() _receivedUser: LoginDto,
    @Request() { user }: LocalAuthenticatedRequest,
  ): Promise<AccessTokenResponse> {
    return await this.authService.login(user);
  }
}
