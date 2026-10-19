import { Test, TestingModule } from '@nestjs/testing';
import { databaseServiceMock } from '../../test/mocks/services/database-service.mock.js';
import { DatabaseService } from '../database/database.service.js';
import { MessageRole } from '../generated/prisma/enums.js';
import { MessagesService } from './messages.service.js';

describe('MessagesService', () => {
  let service: MessagesService;

  beforeEach(async () => {
    vi.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MessagesService,
        {
          provide: DatabaseService,
          useValue: databaseServiceMock,
        },
      ],
    }).compile();

    service = module.get<MessagesService>(MessagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create user message with provided role', async () => {
      const conversationId = 10;
      const content = 'Hello';
      const role = MessageRole.ASSISTANT;

      const createdAt = new Date();

      const expected = {
        id: 1,
        role,
        content,
        createdAt,
      };

      databaseServiceMock.message.create.mockResolvedValue(expected);

      const result = await service.create(conversationId, content, role);

      expect(databaseServiceMock.message.create).toHaveBeenCalledWith({
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
        data: {
          conversationId,
          content,
          role,
        },
      });

      expect(result).toEqual(expected);
    });
  });

  describe('findByConversation', () => {
    it('should return messages ordered by createdAt ascending', async () => {
      const conversationId = 10;
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

      databaseServiceMock.message.findMany.mockResolvedValue(messages);

      const result = await service.findByConversation(conversationId);

      expect(databaseServiceMock.message.findMany).toHaveBeenCalledWith({
        where: {
          conversationId,
        },
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: 'asc',
        },
      });

      expect(result).toEqual(messages);
    });
  });
});
