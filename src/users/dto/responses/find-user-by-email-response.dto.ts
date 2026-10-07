import { OmitType } from '@nestjs/swagger';
import { UserDto } from '../user.dto.js';

export class FindUserByEmailResponse extends OmitType(UserDto, ['createdAt', 'updateddAt']) {}
