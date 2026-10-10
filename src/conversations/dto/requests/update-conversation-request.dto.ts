import { PartialType, PickType } from '@nestjs/swagger';
import { ConversationDto } from '../conversation.dto.js';

export class UpdateConversationRequest extends PartialType(PickType(ConversationDto, ['title'])) {}
