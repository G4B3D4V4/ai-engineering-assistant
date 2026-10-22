import { ExecutionContext } from '@nestjs/common';
import { ThrottlerRequest } from '@nestjs/throttler';

import { WsThrottlerGuard } from './ws-throttler.guard.js';

describe('WsThrottlerGuard', () => {
  let guard: WsThrottlerGuard;

  const createContext = () =>
    ({
      switchToWs: () => ({
        getClient: () => ({
          conn: {
            remoteAddress: '127.0.0.1',
          },
        }),
      }),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    vi.resetAllMocks();

    guard = Object.create(WsThrottlerGuard.prototype) as WsThrottlerGuard;
  });

  it('should allow request when client is not blocked', async () => {
    const increment = vi.fn().mockResolvedValue({
      totalHits: 1,
      timeToExpire: 60_000,
      isBlocked: false,
      timeToBlockExpire: 0,
    });

    Object.assign(guard, {
      storageService: {
        increment,
      },
    });

    const context = createContext();
    const generateKey = vi.fn().mockReturnValue('ws-key');

    const requestProps = {
      context,
      limit: 2,
      ttl: 60_000,
      blockDuration: 60_000,
      throttler: {},
      generateKey,
    } as unknown as ThrottlerRequest;

    const result = await guard.handleRequest(requestProps);

    expect(generateKey).toHaveBeenCalledWith(context, '127.0.0.1', 'default');

    expect(increment).toHaveBeenCalledWith('ws-key', 60_000, 2, 60_000, 'default');

    expect(result).toBe(true);
  });

  it('should throw throttling exception when client is blocked', async () => {
    const increment = vi.fn().mockResolvedValue({
      totalHits: 3,
      timeToExpire: 60_000,
      isBlocked: true,
      timeToBlockExpire: 60_000,
    });

    const throwThrottlingException = vi.fn().mockRejectedValue(new Error('Too Many Requests'));

    Object.assign(guard, {
      storageService: {
        increment,
      },
      throwThrottlingException,
    });

    const context = createContext();

    const requestProps = {
      context,
      limit: 2,
      ttl: 60_000,
      blockDuration: 60_000,
      throttler: {},
      generateKey: vi.fn().mockReturnValue('ws-key'),
    } as unknown as ThrottlerRequest;

    await expect(guard.handleRequest(requestProps)).rejects.toThrow('Too Many Requests');

    expect(throwThrottlingException).toHaveBeenCalledOnce();
  });
});
