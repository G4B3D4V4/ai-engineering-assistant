import { Module } from '@nestjs/common';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsService } from './conversations.service.js';
import { MessagesService } from './messages.service.js';

@Module({
  providers: [ConversationsService, MessagesService],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
