import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { databaseServiceMock } from '../../test/mocks/services/database-service.mock.js';
import { messagesServiceMock } from '../../test/mocks/services/messages-service.mock.js';
import { DatabaseService } from '../database/database.service.js';
import { MessageRole } from '../generated/prisma/enums.js';
import { ConversationsService } from './conversations.service.js';
import { MessagesService } from './messages.service.js';

describe('ConversationsService', () => {
  let service: ConversationsService;

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConversationsService,
        {
          provide: DatabaseService,
          useValue: databaseServiceMock,
        },
        {
          provide: MessagesService,
          useValue: messagesServiceMock,
        },
      ],
    }).compile();

    service = module.get<ConversationsService>(ConversationsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create conversation with initial user message', async () => {
      const userId = 1;
      const dto = { message: 'Hello' };
      const now = new Date();

      const expected = {
        id: 10,
        title: null,
        createdAt: now,
        updatedAt: now,
        messages: [
          {
            id: 1,
            role: MessageRole.USER,
            content: 'Hello',
            createdAt: now,
          },
        ],
      };

      databaseServiceMock.conversation.create.mockResolvedValue(expected);

      const result = await service.create(userId, dto);

      expect(databaseServiceMock.conversation.create).toHaveBeenCalledWith({
        data: {
          userId,
          messages: {
            create: {
              role: MessageRole.USER,
              content: dto.message,
            },
          },
        },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
          messages: {
            select: {
              id: true,
              role: true,
              content: true,
              createdAt: true,
            },
          },
        },
      });

      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return paginated conversations', async () => {
      const userId = 1;
      const params = { page: 2, limit: 10 };
      const now = new Date();

      const conversations = [
        {
          id: 11,
          title: 'Test',
          createdAt: now,
          updatedAt: now,
        },
      ];

      databaseServiceMock.conversation.findMany.mockResolvedValue(conversations);
      databaseServiceMock.conversation.count.mockResolvedValue(25);

      const result = await service.findAll(userId, params);

      expect(databaseServiceMock.conversation.findMany).toHaveBeenCalledWith({
        where: { userId },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
        take: 10,
        skip: 10,
        orderBy: { updatedAt: 'desc' },
      });

      expect(databaseServiceMock.conversation.count).toHaveBeenCalledWith({
        where: { userId },
      });

      expect(result.data).toEqual(conversations);
      expect(result.meta).toEqual({
        currentPage: 2,
        pagesCount: 3,
        nextPage: 3,
        prevPage: 1,
        pages: ['1', '2', '3'],
        totalCount: 25,
      });
    });
  });

  describe('findOne', () => {
    it('should return conversation', async () => {
      const now = new Date();

      const conversation = {
        id: 10,
        title: 'Test',
        createdAt: now,
        updatedAt: now,
        messages: [],
      };

      databaseServiceMock.conversation.findUnique.mockResolvedValue(conversation);

      const result = await service.findOne(10, 1);

      expect(result).toEqual(conversation);
    });

    it('should throw NotFoundException when conversation does not exist', async () => {
      databaseServiceMock.conversation.findUnique.mockResolvedValue(null);

      await expect(service.findOne(10, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addMessage', () => {
    it('should add message when conversation belongs to user', async () => {
      databaseServiceMock.conversation.findUnique.mockResolvedValue({
        id: 10,
      });

      const now = new Date();
      const expected = {
        id: 5,
        role: MessageRole.USER,
        content: 'New message',
        createdAt: now,
      };

      messagesServiceMock.create.mockResolvedValue(expected);

      const result = await service.addMessage(1, 10, 'New message', MessageRole.USER);

      expect(messagesServiceMock.create).toHaveBeenCalledWith(10, 'New message', MessageRole.USER);

      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException when conversation does not belong to user', async () => {
      databaseServiceMock.conversation.findUnique.mockResolvedValue(null);

      await expect(service.addMessage(1, 10, 'New message', MessageRole.USER)).rejects.toThrow(
        NotFoundException,
      );

      expect(messagesServiceMock.create).not.toHaveBeenCalled();
    });
  });

  describe('getMessages', () => {
    it('should return conversation messages when conversation belongs to user', async () => {
      databaseServiceMock.conversation.findUnique.mockResolvedValue({
        id: 10,
      });

      const now = new Date();

      const messages = [
        {
          id: 1,
          role: MessageRole.USER,
          content: 'Hello',
          createdAt: now,
        },
        {
          id: 2,
          role: MessageRole.ASSISTANT,
          content: 'Hi',
          createdAt: now,
        },
      ];

      messagesServiceMock.findByConversation.mockResolvedValue(messages);

      const result = await service.getMessages(1, 10);

      expect(messagesServiceMock.findByConversation).toHaveBeenCalledWith(10);

      expect(result).toEqual(messages);
    });

    it('should throw NotFoundException when conversation does not belong to user', async () => {
      databaseServiceMock.conversation.findUnique.mockResolvedValue(null);

      await expect(service.getMessages(1, 10)).rejects.toThrow(NotFoundException);

      expect(messagesServiceMock.findByConversation).not.toHaveBeenCalled();
    });
  });

  describe('updateTitle', () => {
    it('should update conversation title', async () => {
      databaseServiceMock.conversation.findUnique.mockResolvedValue({
        id: 10,
      });

      const now = new Date();
      const expected = {
        id: 10,
        title: 'Updated title',
        createdAt: now,
        updatedAt: now,
      };

      databaseServiceMock.conversation.update.mockResolvedValue(expected);

      const result = await service.updateTitle(10, 1, {
        title: 'Updated title',
      });

      expect(databaseServiceMock.conversation.update).toHaveBeenCalledWith({
        where: { id: 10, userId: 1 },
        data: { title: 'Updated title' },
        select: {
          id: true,
          title: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should delete conversation', async () => {
      databaseServiceMock.conversation.findUnique.mockResolvedValue({
        id: 10,
      });

      databaseServiceMock.conversation.delete.mockResolvedValue({
        id: 10,
      });

      await service.delete(10, 1);

      expect(databaseServiceMock.conversation.delete).toHaveBeenCalledWith({
        where: { id: 10, userId: 1 },
      });
    });
  });
});
