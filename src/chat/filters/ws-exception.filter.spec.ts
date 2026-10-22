import { ArgumentsHost, BadRequestException, NotFoundException } from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { Socket } from 'socket.io';
import { createSocketMock } from '../../../test/mocks/socket/socket.mock.js';
import { WsExceptionFilter } from './ws-exception.filter.js';

describe('WsExceptionFilter', () => {
  let filter: WsExceptionFilter;

  const createHostMock = (client: Socket) =>
    ({
      switchToWs: () => ({
        getClient: () => client,
      }),
    }) as unknown as ArgumentsHost;

  beforeEach(() => {
    vi.resetAllMocks();

    filter = new WsExceptionFilter();
  });

  describe('BadRequestException', () => {
    it('should emit validation error', () => {
      const client = createSocketMock();

      const host = createHostMock(client);

      const exception = new BadRequestException({
        message: [
          'conversationId must be an integer number',
          'conversationId must not be less than 1',
        ],
      });

      filter.catch(exception, host);

      expect(client.emit).toHaveBeenCalledWith('chat:error', {
        type: 'validation',
        message: 'Validation failed',
        errors: [
          'conversationId must be an integer number',
          'conversationId must not be less than 1',
        ],
      });
    });
  });

  describe('NotFoundException', () => {
    it('should emit not found error', () => {
      const client = createSocketMock();

      const host = createHostMock(client);

      const exception = new NotFoundException('Conversation not found');

      filter.catch(exception, host);

      expect(client.emit).toHaveBeenCalledWith('chat:error', {
        type: 'not_found',
        message: 'Conversation not found',
      });
    });
  });

  describe('unknown error', () => {
    it('should emit internal error', () => {
      const client = createSocketMock();

      const host = createHostMock(client);

      filter.catch(new Error('Unexpected error'), host);

      expect(client.emit).toHaveBeenCalledWith('chat:error', {
        type: 'internal',
        message: 'Something went wrong',
      });
    });
  });

  describe('ThrottlerException', () => {
    it('should emit rate limit error', () => {
      const client = createSocketMock();

      const host = createHostMock(client);

      const exception = new ThrottlerException();

      filter.catch(exception, host);

      expect(client.emit).toHaveBeenCalledWith('chat:error', {
        type: 'rate_limit',
        message: 'Too many requests',
      });
    });
  });
});
