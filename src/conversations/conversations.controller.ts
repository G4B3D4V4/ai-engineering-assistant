import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard.js';
import type { JwtAuthenticatedRequest } from '../auth/interfaces/authenticated-request.interface.js';
import { CONVERSATION_API_MESSAGES } from '../common/consts/message.constants.js';
import { ConversationsService } from './conversations.service.js';
import { AddMessageRequest } from './dto/requests/add-message-request.dto.js';
import { CreateConversationRequest } from './dto/requests/create-conversation-request.dto.js';
import { SearchConversationsRequest } from './dto/requests/search-conversations-request.dto.js';
import { UpdateConversationRequest } from './dto/requests/update-conversation-request.dto.js';
import {
  CreateConversationResponse,
  MessagesResponse,
} from './dto/responses/create-conversation-response.dto.js';
import { SearchConversationResponse } from './dto/responses/search-conversation-response.dto.js';
import { SearchConversationsResponse } from './dto/responses/search-conversations-response.dto.js';
import { UpdateConversationResponse } from './dto/responses/update-conversation-response.dto.js';

@ApiTags('Conversations')
@ApiBearerAuth('jwt-token')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @ApiOperation({ summary: 'Create new conversation with initial message' })
  @ApiCreatedResponse({
    description: 'Created conversation',
    type: CreateConversationResponse,
  })
  @Post()
  async create(
    @Body() body: CreateConversationRequest,
    @Request() { user }: JwtAuthenticatedRequest,
  ): Promise<CreateConversationResponse> {
    return this.conversationsService.create(user.id, body);
  }

  @ApiOperation({ summary: 'Add new user message to conversation' })
  @ApiCreatedResponse({
    description: 'created message',
    type: MessagesResponse,
  })
  @ApiNotFoundResponse({ description: CONVERSATION_API_MESSAGES.NOT_FOUND })
  @Post(':id/messages')
  async addMessage(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: AddMessageRequest,
    @Request() { user }: JwtAuthenticatedRequest,
  ): Promise<MessagesResponse> {
    return this.conversationsService.addMessage(user.id, id, body);
  }

  @ApiOperation({ summary: 'Get conversations list for user' })
  @ApiOkResponse({
    description: 'Found conversations for user',
    type: SearchConversationsResponse,
  })
  @Get()
  async findAll(
    @Query() query: SearchConversationsRequest,
    @Request() { user }: JwtAuthenticatedRequest,
  ): Promise<SearchConversationsResponse> {
    return this.conversationsService.findAll(user.id, query);
  }

  @ApiOperation({ summary: 'Get conversation for user' })
  @ApiOkResponse({
    description: 'Found conversation for user',
    type: SearchConversationResponse,
  })
  @ApiNotFoundResponse({ description: CONVERSATION_API_MESSAGES.NOT_FOUND })
  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @Request() { user }: JwtAuthenticatedRequest,
  ): Promise<SearchConversationResponse> {
    return this.conversationsService.findOne(id, user.id);
  }

  @ApiOperation({ summary: 'Set conversation title' })
  @ApiOkResponse({
    description: 'updated conversation',
    type: UpdateConversationResponse,
  })
  @ApiNotFoundResponse({ description: CONVERSATION_API_MESSAGES.NOT_FOUND })
  @Patch(':id')
  async updateTitle(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateConversationRequest,
    @Request() { user }: JwtAuthenticatedRequest,
  ): Promise<UpdateConversationResponse> {
    return this.conversationsService.updateTitle(id, user.id, body);
  }

  @ApiOperation({ summary: 'Delete conversation' })
  @ApiNoContentResponse({
    description: 'conversation deleted',
    type: undefined,
  })
  @ApiNotFoundResponse({ description: CONVERSATION_API_MESSAGES.NOT_FOUND })
  @HttpCode(HttpStatus.NO_CONTENT)
  @Delete(':id')
  async delete(
    @Param('id', ParseIntPipe) id: number,
    @Request() { user }: JwtAuthenticatedRequest,
  ): Promise<void> {
    return this.conversationsService.delete(id, user.id);
  }
}
