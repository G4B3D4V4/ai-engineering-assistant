import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  HttpException,
  NotFoundException,
} from '@nestjs/common';
import { ThrottlerException } from '@nestjs/throttler';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';

@Catch()
export class WsExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof BadRequestException) {
      const response = exception.getResponse();

      const errors =
        typeof response === 'object' && response !== null && 'message' in response
          ? response.message
          : [];

      client.emit('chat:error', {
        type: 'validation',
        message: 'Validation failed',
        errors: Array.isArray(errors) ? errors : [errors],
      });

      return;
    }

    if (exception instanceof NotFoundException) {
      client.emit('chat:error', {
        type: 'not_found',
        message: 'Conversation not found',
      });

      return;
    }

    if (exception instanceof WsException) {
      const error = exception.getError();

      client.emit(
        'chat:error',
        typeof error === 'string'
          ? {
              type: 'internal',
              message: error,
            }
          : error,
      );

      return;
    }

    if (exception instanceof ThrottlerException) {
      client.emit('chat:error', {
        type: 'rate_limit',
        message: 'Too many requests',
      });

      return;
    }

    if (exception instanceof HttpException) {
      client.emit('chat:error', {
        type: 'internal',
        message: exception.message,
      });

      return;
    }

    client.emit('chat:error', {
      type: 'internal',
      message: 'Something went wrong',
    });
  }
}
