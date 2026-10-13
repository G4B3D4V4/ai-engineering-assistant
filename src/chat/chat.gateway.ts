import { UseFilters } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ConversationsService } from '../conversations/conversations.service.js';
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
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(client: Socket) {
    const token = client.handshake.auth.token;

    try {
      const payload = await this.jwtService.verifyAsync(token);

      client.data.user = {
        id: payload.sub,
        email: payload.email,
      };

      console.log('Authenticated user:', client.data.user);
    } catch {
      console.log('Invalid token');
      client.disconnect();
    }
  }

  @SubscribeMessage('chat:message')
  async handleMessage(@MessageBody() message: ChatMessageDto, @ConnectedSocket() client: Socket) {
    const userId = client.data.user.id;

    const savedMessage = await this.conversationsService.addMessage(
      userId,
      message.conversationId,
      {
        content: message.content,
      },
    );

    const chunks = ['Hello', ' from', ' assistant'];

    client.emit('chat:stream:start', {
      conversationId: message.conversationId,
      messageId: savedMessage.id,
    });

    for (const chunk of chunks) {
      // eslint-disable-next-line no-await-in-loop -- mock streaming must be sequential
      await new Promise(resolve => setTimeout(resolve, 300));

      client.emit('chat:stream:chunk', {
        content: chunk,
      });
    }

    client.emit('chat:stream:end', {
      conversationId: message.conversationId,
    });
  }
}
