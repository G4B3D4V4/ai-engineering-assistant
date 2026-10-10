import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service.js';
import { MessageRole } from '../generated/prisma/enums.js';
import { AddMessageRequest } from './dto/requests/add-message-request.dto.js';
import { MessagesResponse } from './dto/responses/create-conversation-response.dto.js';

@Injectable()
export class MessagesService {
  constructor(private readonly db: DatabaseService) {}

  async create(conversationId: number, dto: AddMessageRequest): Promise<MessagesResponse> {
    return this.db.message.create({
      select: { id: true, role: true, content: true, createdAt: true },
      data: {
        conversationId,
        content: dto.content,
        role: MessageRole.USER,
      },
    });
  }
}
