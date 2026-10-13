import { MessageRole } from '../../../src/generated/prisma/enums.js';

export const mockChatMessage = {
  conversationId: 2,
  content: 'Hello',
};

export const mockSavedUserMessage = {
  id: 10,
  role: MessageRole.USER,
  content: 'Hello',
  createdAt: new Date(),
};

export const mockJwtPayload = {
  sub: 1,
  email: 'john@example.com',
};
