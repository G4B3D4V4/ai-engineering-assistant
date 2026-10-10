import { OmitType, PickType } from '@nestjs/swagger';
import { MessageDto } from '../message.dto.js';

export class AddMessageRequest extends PickType(MessageDto, ['content']) {}
