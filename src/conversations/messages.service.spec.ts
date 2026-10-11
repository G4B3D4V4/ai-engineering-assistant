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
    it('should create user message', async () => {
      const conversationId = 10;
      const dto = {
        content: 'Hello',
      };

      const createdAt = new Date();

      const expected = {
        id: 1,
        role: MessageRole.USER,
        content: dto.content,
        createdAt,
      };

      databaseServiceMock.message.create.mockResolvedValue(expected);

      const result = await service.create(conversationId, dto);

      expect(databaseServiceMock.message.create).toHaveBeenCalledWith({
        select: {
          id: true,
          role: true,
          content: true,
          createdAt: true,
        },
        data: {
          conversationId,
          content: dto.content,
          role: MessageRole.USER,
        },
      });

      expect(result).toEqual(expected);
    });
  });
});
