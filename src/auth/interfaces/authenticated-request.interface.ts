import type { Request } from 'express';
import type { UserResponse } from '../../users/dto/responses/user-response.dto.js';

export interface AuthenticatedRequest extends Request {
  user: UserResponse;
}
