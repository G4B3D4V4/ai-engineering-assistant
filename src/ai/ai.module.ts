import { Module } from '@nestjs/common';
import { AI_PROVIDER } from '../common/consts/ai.constants.js';
import { AiService } from './ai.service.js';
import { OpenAiProvider } from './providers/openai.provider.js';

@Module({
  providers: [AiService, { provide: AI_PROVIDER, useClass: OpenAiProvider }],
  exports: [AiService],
})
export class AiModule {}
