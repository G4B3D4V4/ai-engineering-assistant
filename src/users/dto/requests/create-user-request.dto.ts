import { OmitType } from '@nestjs/swagger';
import { UserDto } from '../user.dto.js';

export class CreateUserRequest extends OmitType(UserDto, ['id', 'createdAt', 'updatedAt']) {}
