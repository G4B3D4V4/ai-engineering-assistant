import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { MessageRole } from '../generated/prisma/enums.js';
import { MessagesResponse } from './dto/responses/create-conversation-response.dto.js';

@Injectable()
export class MessagesService {
  constructor(private readonly db: DatabaseService) {}

  async create(
    conversationId: number,
    content: string,
    role: MessageRole,
  ): Promise<MessagesResponse> {
    return this.db.message.create({
      select: { id: true, role: true, content: true, createdAt: true },
      data: {
        conversationId,
        content,
        role,
      },
    });
  }

  async findByConversation(conversationId: number): Promise<MessagesResponse[]> {
    return this.db.message.findMany({
      where: { conversationId },
      select: { id: true, role: true, content: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
  }
}
