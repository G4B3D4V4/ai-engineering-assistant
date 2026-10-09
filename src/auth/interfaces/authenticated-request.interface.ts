import type { Request } from 'express';
import type { UserResponse } from '../../users/dto/responses/user-response.dto.js';

export interface JwtAuthenticatedUser {
  id: number;
  email: string;
}

export interface JwtAuthenticatedRequest extends Request {
  user: JwtAuthenticatedUser;
}

export interface LocalAuthenticatedRequest extends Request {
  user: UserResponse;
}
