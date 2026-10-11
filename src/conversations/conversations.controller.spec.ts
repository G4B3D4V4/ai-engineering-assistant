import { Test, TestingModule } from '@nestjs/testing';
import { conversationsServiceMock } from '../../test/mocks/services/conversations-service.mock.js';
import { ConversationsController } from './conversations.controller.js';
import { ConversationsService } from './conversations.service.js';

describe('ConversationsController', () => {
  let controller: ConversationsController;

  const request = {
    user: {
      id: 1,
      email: 'john_doe@example.com',
    },
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConversationsController],
      providers: [
        {
          provide: ConversationsService,
          useValue: conversationsServiceMock,
        },
      ],
    }).compile();

    controller = module.get<ConversationsController>(ConversationsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create conversation', async () => {
      const body = {
        message: 'Hello',
      };

      const expected = {
        id: 10,
        title: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      conversationsServiceMock.create.mockResolvedValue(expected);

      const result = await controller.create(body, request as any);

      expect(conversationsServiceMock.create).toHaveBeenCalledWith(1, body);
      expect(result).toEqual(expected);
    });
  });

  describe('addMessage', () => {
    it('should add message', async () => {
      const body = {
        content: 'Hello again',
      };

      const expected = {
        id: 5,
        role: 'USER',
        content: 'Hello again',
        createdAt: new Date(),
      };

      conversationsServiceMock.addMessage.mockResolvedValue(expected);

      const result = await controller.addMessage(10, body, request as any);

      expect(conversationsServiceMock.addMessage).toHaveBeenCalledWith(1, 10, body);
      expect(result).toEqual(expected);
    });
  });

  describe('findAll', () => {
    it('should return conversations', async () => {
      const query = {
        page: 1,
        limit: 10,
      };

      const expected = {
        data: [],
        meta: {
          currentPage: 1,
          pagesCount: 0,
          nextPage: null,
          prevPage: null,
          pages: [],
          totalCount: 0,
        },
      };

      conversationsServiceMock.findAll.mockResolvedValue(expected);

      const result = await controller.findAll(query, request as any);

      expect(conversationsServiceMock.findAll).toHaveBeenCalledWith(1, query);
      expect(result).toEqual(expected);
    });
  });

  describe('findOne', () => {
    it('should return conversation', async () => {
      const expected = {
        id: 10,
        title: 'Test',
        createdAt: new Date(),
        updatedAt: new Date(),
        messages: [],
      };

      conversationsServiceMock.findOne.mockResolvedValue(expected);

      const result = await controller.findOne(10, request as any);

      expect(conversationsServiceMock.findOne).toHaveBeenCalledWith(10, 1);
      expect(result).toEqual(expected);
    });
  });

  describe('updateTitle', () => {
    it('should update conversation title', async () => {
      const body = {
        title: 'Updated title',
      };

      const expected = {
        id: 10,
        title: 'Updated title',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      conversationsServiceMock.updateTitle.mockResolvedValue(expected);

      const result = await controller.updateTitle(10, body, request as any);

      expect(conversationsServiceMock.updateTitle).toHaveBeenCalledWith(10, 1, body);
      expect(result).toEqual(expected);
    });
  });

  describe('delete', () => {
    it('should delete conversation', async () => {
      conversationsServiceMock.delete.mockResolvedValue(undefined);

      await controller.delete(10, request as any);

      expect(conversationsServiceMock.delete).toHaveBeenCalledWith(10, 1);
    });
  });
});
