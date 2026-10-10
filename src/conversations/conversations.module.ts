import { Module } from '@nestjs/common';
import { ConversationsService } from './conversations.service.js';
import { ConversationsController } from './conversations.controller.js';
import { MessagesService } from './messages.service.js';

@Module({
  providers: [ConversationsService, MessagesService],
  controllers: [ConversationsController],
})
export class ConversationsModule {}
