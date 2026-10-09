import { vi } from 'vitest';

export const authServiceMock = {
  login: vi.fn(),
  register: vi.fn(),
  validateUser: vi.fn(),
};
