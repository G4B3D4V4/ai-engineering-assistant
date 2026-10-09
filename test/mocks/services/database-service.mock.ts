import { vi } from 'vitest';

export const databaseServiceMock = {
  user: {
    create: vi.fn(),
    findUnique: vi.fn(),
  },
};
