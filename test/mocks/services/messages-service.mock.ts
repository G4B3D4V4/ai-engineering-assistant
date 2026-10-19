import { vi } from 'vitest';

export const messagesServiceMock = {
  create: vi.fn(),
  findByConversation: vi.fn(),
};
