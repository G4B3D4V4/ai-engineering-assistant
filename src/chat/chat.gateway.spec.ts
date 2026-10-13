import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import {
  mockChatMessage,
  mockJwtPayload,
  mockSavedUserMessage,
} from '../../test/fixtures/chat/chat.fixture.js';
import { conversationsServiceMock } from '../../test/mocks/services/conversations-service.mock.js';
import { jwtServiceMock } from '../../test/mocks/services/jwt-service.mock.js';
import { createSocketMock } from '../../test/mocks/socket/socket.mock.js';

import { ConversationsService } from '../conversations/conversations.service.js';
import { ChatGateway } from './chat.gateway.js';

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
      ],
    }).compile();

    gateway = module.get<ChatGateway>(ChatGateway);
  });

  afterEach(() => {
    vi.useRealTimers();
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
  });

  describe('handleMessage', () => {
    it('should save user message and stream mock assistant response', async () => {
      vi.useFakeTimers();

      const client = createSocketMock();

      client.data.user = {
        id: mockJwtPayload.sub,
        email: mockJwtPayload.email,
      };

      conversationsServiceMock.addMessage.mockResolvedValue(mockSavedUserMessage);

      const promise = gateway.handleMessage(mockChatMessage, client);

      await vi.runAllTimersAsync();
      await promise;

      expect(conversationsServiceMock.addMessage).toHaveBeenCalledWith(
        mockJwtPayload.sub,
        mockChatMessage.conversationId,
        {
          content: mockChatMessage.content,
        },
      );

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
        content: ' assistant',
      });

      expect(client.emit).toHaveBeenNthCalledWith(5, 'chat:stream:end', {
        conversationId: mockChatMessage.conversationId,
      });
    });
  });
});
