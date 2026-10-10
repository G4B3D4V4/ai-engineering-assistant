import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { CreateConversationRequest } from './dto/requests/create-conversation-request.dto.js';
import { MessageRole } from '../generated/prisma/enums.js';
import {
  CreateConversationResponse,
  MessagesResponse,
} from './dto/responses/create-conversation-response.dto.js';
import { SearchConversationsResponse } from './dto/responses/search-conversations-response.dto.js';
import { SearchConversationResponse } from './dto/responses/search-conversation-response.dto.js';
import { AddMessageRequest } from './dto/requests/add-message-request.dto.js';
import { UpdateConversationRequest } from './dto/requests/update-conversation-request.dto.js';
import { UpdateConversationResponse } from './dto/responses/update-conversation-response.dto.js';
import { MessagesService } from './messages.service.js';
import { SearchConversationsRequest } from './dto/requests/search-conversations-request.dto.js';
import { generatePaginator } from '../common/helpers/paginator.helper.js';

@Injectable()
export class ConversationsService {
  constructor(
    private readonly db: DatabaseService,
    private readonly messagesService: MessagesService,
  ) {}

  async create(
    userId: number,
    dto: CreateConversationRequest,
  ): Promise<CreateConversationResponse> {
    return this.db.conversation.create({
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
  }

  async findAll(
    userId: number,
    params: SearchConversationsRequest,
  ): Promise<SearchConversationsResponse> {
    const { page, limit } = params;
    const skip: number = page * limit - params.limit;

    const [data, totalCount] = await Promise.all([
      this.db.conversation.findMany({
        where: { userId },
        select: { id: true, title: true, createdAt: true, updatedAt: true },
        take: limit,
        skip,
        orderBy: { updatedAt: 'desc' },
      }),
      this.db.conversation.count({ where: { userId } }),
    ]);

    return {
      data,
      meta: generatePaginator({ totalCount, currentPage: page, limit }),
    };
  }

  async findOne(id: number, userId: number): Promise<SearchConversationResponse> {
    const result = await this.db.conversation.findUnique({
      where: { id, userId },
      select: {
        id: true,
        title: true,
        createdAt: true,
        updatedAt: true,
        messages: {
          select: { id: true, content: true, role: true, createdAt: true },
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!result) throw new NotFoundException('Conversation not found');

    return result;
  }

  async addMessage(
    userId: number,
    conversationId: number,
    dto: AddMessageRequest,
  ): Promise<MessagesResponse> {
    await this.findOne(conversationId, userId);

    return this.messagesService.create(conversationId, dto);
  }

  async updateTitle(
    id: number,
    userId: number,
    dto: UpdateConversationRequest,
  ): Promise<UpdateConversationResponse> {
    await this.findOne(id, userId);
    return this.db.conversation.update({
      where: { id, userId },
      data: { title: dto.title },
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    });
  }

  async delete(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId);
    await this.db.conversation.delete({ where: { id, userId } });
  }
}
