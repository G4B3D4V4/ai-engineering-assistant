import { vi } from 'vitest';

export const databaseServiceMock = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },

  conversation: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },

  message: {
    create: vi.fn(),
  },
};
