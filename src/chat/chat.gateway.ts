import { UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { AiService } from '../ai/ai.service.js';
import { ConversationsService } from '../conversations/conversations.service.js';
import { MessageRole } from '../generated/prisma/enums.js';
import { ChatMessageDto } from './dto/chat-message.dto.js';
import { WsExceptionFilter } from './filters/ws-exception.filter.js';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly conversationsService: ConversationsService,
    private readonly aiService: AiService,
  ) {}

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    try {
      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = {
        id: payload.sub,
        email: payload.email,
      };
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:message')
  async handleMessage(@MessageBody() message: ChatMessageDto, @ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;

    await this.conversationsService.addMessage(
      userId,
      message.conversationId,
      message.content,
      MessageRole.USER,
    );

    const history = await this.conversationsService.getMessages(userId, message.conversationId);

    client.emit('chat:stream:start', {
      conversationId: message.conversationId,
    });

    let assistantResponse = '';

    for await (const chunk of this.aiService.stream(history)) {
      assistantResponse += chunk;

      client.emit('chat:stream:chunk', {
        content: chunk,
      });
    }

    await this.conversationsService.addMessage(
      userId,
      message.conversationId,
      assistantResponse,
      MessageRole.ASSISTANT,
    );

    client.emit('chat:stream:end', {
      conversationId: message.conversationId,
    });
  }
}
