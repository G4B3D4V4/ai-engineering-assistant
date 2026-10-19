import { Module } from '@nestjs/common';
import { AiModule } from '../ai/ai.module.js';
import { AuthModule } from '../auth/auth.module.js';
import { ConversationsModule } from '../conversations/conversations.module.js';
import { ChatGateway } from './chat.gateway.js';

@Module({
  providers: [ChatGateway],
  imports: [AuthModule, ConversationsModule, AiModule],
})
export class ChatModule {}
