import { Inject, Injectable } from '@nestjs/common';
import { AI_PROVIDER } from '../common/consts/ai.constants.js';
import type { AiMessage, AiProvider } from '../common/interfaces/ai.interface.js';

@Injectable()
export class AiService {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AiProvider) {}

  stream(messages: AiMessage[]): AsyncIterable<string> {
    return this.provider.stream(messages);
  }
}
