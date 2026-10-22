import { ExecutionContext } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

import { HttpThrottlerGuard } from './http-throttler.guard.js';

describe('HttpThrottlerGuard', () => {
  let guard: HttpThrottlerGuard;

  beforeEach(() => {
    vi.restoreAllMocks();

    guard = Object.create(HttpThrottlerGuard.prototype) as HttpThrottlerGuard;
  });

  it('should skip throttling for non-http contexts', async () => {
    const parentGuardSpy = vi
      .spyOn(ThrottlerGuard.prototype, 'canActivate')
      .mockResolvedValue(true);

    const context = {
      getType: () => 'ws',
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(parentGuardSpy).not.toHaveBeenCalled();
  });

  it('should delegate http requests to ThrottlerGuard', async () => {
    const parentGuardSpy = vi
      .spyOn(ThrottlerGuard.prototype, 'canActivate')
      .mockResolvedValue(true);

    const context = {
      getType: () => 'http',
    } as unknown as ExecutionContext;

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(parentGuardSpy).toHaveBeenCalledWith(context);
  });
});
