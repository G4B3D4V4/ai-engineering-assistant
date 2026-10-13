import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module.js';
import { ConversationsModule } from '../conversations/conversations.module.js';
import { ChatGateway } from './chat.gateway.js';

@Module({
  providers: [ChatGateway],
  imports: [AuthModule, ConversationsModule],
})
export class ChatModule {}
