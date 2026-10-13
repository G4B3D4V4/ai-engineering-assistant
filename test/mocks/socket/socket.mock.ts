// test/mocks/socket.mock.ts

import { Socket } from 'socket.io';
import { vi } from 'vitest';

export const createSocketMock = () =>
  ({
    id: 'socket-id',
    handshake: {
      auth: {
        token: 'valid-token',
      },
    },
    data: {},
    emit: vi.fn(),
    disconnect: vi.fn(),
  }) as unknown as Socket;
