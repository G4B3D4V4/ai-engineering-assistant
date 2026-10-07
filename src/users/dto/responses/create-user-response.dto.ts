import { OmitType } from '@nestjs/swagger';
import { UserDto } from '../user.dto.js';

export class CreateUserResponse extends OmitType(UserDto, [
  'password',
  'createdAt',
  'updateddAt',
]) {}
