import { vi } from 'vitest';

export const usersServiceMock = {
  create: vi.fn(),
  findByEmail: vi.fn(),
  findById: vi.fn(),
};
