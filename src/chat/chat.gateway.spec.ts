import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import {
  mockChatMessage,
  mockJwtPayload,
  mockSavedUserMessage,
} from '../../test/fixtures/chat/chat.fixture.js';
import { aiServiceMock } from '../../test/mocks/services/ai-service.mock.js';
import { conversationsServiceMock } from '../../test/mocks/services/conversations-service.mock.js';
import { jwtServiceMock } from '../../test/mocks/services/jwt-service.mock.js';
import { createSocketMock } from '../../test/mocks/socket/socket.mock.js';

import { AiService } from '../ai/ai.service.js';
import { ConversationsService } from '../conversations/conversations.service.js';
import { MessageRole } from '../generated/prisma/enums.js';
import { ChatGateway } from './chat.gateway.js';
import { WsThrottlerGuard } from './guards/ws-throttler.guard.js';

describe('ChatGateway', () => {
  let gateway: ChatGateway;

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatGateway,
        {
          provide: JwtService,
          useValue: jwtServiceMock,
        },
        {
          provide: ConversationsService,
          useValue: conversationsServiceMock,
        },
        {
          provide: AiService,
          useValue: aiServiceMock,
        },
      ],
    })
      .overrideGuard(WsThrottlerGuard)
      .useValue({
        canActivate: vi.fn().mockResolvedValue(true),
      })
      .compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('handleConnection', () => {
    it('should authenticate client and store user data', async () => {
      const client = createSocketMock();

      jwtServiceMock.verifyAsync.mockResolvedValue(mockJwtPayload);

      await gateway.handleConnection(client);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('valid-token');

      expect(client.data.user).toEqual({
        id: mockJwtPayload.sub,
        email: mockJwtPayload.email,
      });

      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('should disconnect client when token is invalid', async () => {
      const client = createSocketMock();

      jwtServiceMock.verifyAsync.mockRejectedValue(new Error('Invalid token'));

      await gateway.handleConnection(client);

      expect(client.disconnect).toHaveBeenCalledOnce();
    });

    it('should authenticate client using authorization header', async () => {
      const client = createSocketMock();

      client.handshake.auth = {};
      client.handshake.headers = {
        authorization: 'Bearer header-token',
      };

      jwtServiceMock.verifyAsync.mockResolvedValue(mockJwtPayload);

      await gateway.handleConnection(client);

      expect(jwtServiceMock.verifyAsync).toHaveBeenCalledWith('header-token');

      expect(client.data.user).toEqual({
        id: mockJwtPayload.sub,
        email: mockJwtPayload.email,
      });

      expect(client.disconnect).not.toHaveBeenCalled();
    });
  });

  describe('handleMessage', () => {
    it('should save user message, load history, stream assistant response and save it', async () => {
      const client = createSocketMock();

      client.data.user = {
        id: mockJwtPayload.sub,
        email: mockJwtPayload.email,
      };

      const history = [
        {
          id: 1,
          role: MessageRole.USER,
          content: mockChatMessage.content,
          createdAt: new Date(),
        },
      ];

      async function* mockStream() {
        yield 'Hello';
        yield ' from';
        yield ' AI';
      }

      conversationsServiceMock.addMessage.mockResolvedValue(mockSavedUserMessage);
      conversationsServiceMock.getMessages.mockResolvedValue(history);
      aiServiceMock.stream.mockReturnValue(mockStream());

      await gateway.handleMessage(mockChatMessage, client);

      expect(conversationsServiceMock.addMessage).toHaveBeenNthCalledWith(
        1,
        mockJwtPayload.sub,
        mockChatMessage.conversationId,
        mockChatMessage.content,
        MessageRole.USER,
      );

      expect(conversationsServiceMock.getMessages).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockChatMessage.conversationId,
      );

      expect(aiServiceMock.stream).toHaveBeenCalledWith(history);

      expect(client.emit).toHaveBeenNthCalledWith(1, 'chat:stream:start', {
        conversationId: mockChatMessage.conversationId,
      });

      expect(client.emit).toHaveBeenNthCalledWith(2, 'chat:stream:chunk', {
        content: 'Hello',
      });

      expect(client.emit).toHaveBeenNthCalledWith(3, 'chat:stream:chunk', {
        content: ' from',
      });

      expect(client.emit).toHaveBeenNthCalledWith(4, 'chat:stream:chunk', {
        content: ' AI',
      });

      expect(conversationsServiceMock.addMessage).toHaveBeenNthCalledWith(
        2,
        mockJwtPayload.sub,
        mockChatMessage.conversationId,
        'Hello from AI',
        MessageRole.ASSISTANT,
      );

      expect(client.emit).toHaveBeenNthCalledWith(5, 'chat:stream:end', {
        conversationId: mockChatMessage.conversationId,
      });
    });

    it('should not save assistant message or emit stream:end when AI stream fails', async () => {
      const client = createSocketMock();

      client.data.user = {
        id: mockJwtPayload.sub,
        email: mockJwtPayload.email,
      };

      const history = [
        {
          id: 1,
          role: MessageRole.USER,
          content: mockChatMessage.content,
          createdAt: new Date(),
        },
      ];

      async function* failingStream() {
        yield 'Partial response';
        throw new Error('Provider failed');
      }

      conversationsServiceMock.addMessage.mockResolvedValue(mockSavedUserMessage);
      conversationsServiceMock.getMessages.mockResolvedValue(history);
      aiServiceMock.stream.mockReturnValue(failingStream());

      await expect(gateway.handleMessage(mockChatMessage, client)).rejects.toThrow(
        'Provider failed',
      );

      expect(conversationsServiceMock.addMessage).toHaveBeenCalledTimes(1);

      expect(conversationsServiceMock.addMessage).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockChatMessage.conversationId,
        mockChatMessage.content,
        MessageRole.USER,
      );

      expect(client.emit).toHaveBeenCalledWith('chat:stream:start', {
        conversationId: mockChatMessage.conversationId,
      });

      expect(client.emit).toHaveBeenCalledWith('chat:stream:chunk', {
        content: 'Partial response',
      });

      expect(client.emit).not.toHaveBeenCalledWith('chat:stream:end', expect.anything());
    });
  });
});
