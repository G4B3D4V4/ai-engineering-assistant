import { PickType } from '@nestjs/swagger';
import { ConversationDto } from '../conversation.dto.js';

export class UpdateConversationRequest extends PickType(ConversationDto, ['title']) {}
