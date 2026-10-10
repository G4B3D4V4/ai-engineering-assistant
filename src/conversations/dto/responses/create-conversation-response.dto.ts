import { ApiResponseProperty, OmitType } from '@nestjs/swagger';
import { ConversationDto } from '../conversation.dto.js';
import { MessageDto } from '../message.dto.js';

export class MessagesResponse extends OmitType(MessageDto, ['conversationId']) {}

export class CreateConversationResponse extends OmitType(ConversationDto, ['userId']) {
  @ApiResponseProperty({ type: [MessagesResponse] })
  messages: MessagesResponse[];
}
