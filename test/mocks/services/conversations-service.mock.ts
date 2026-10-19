import { vi } from 'vitest';

export const conversationsServiceMock = {
  create: vi.fn(),
  addMessage: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  updateTitle: vi.fn(),
  delete: vi.fn(),
  getMessages: vi.fn(),
};
