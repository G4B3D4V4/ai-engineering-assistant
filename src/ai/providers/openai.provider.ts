import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { AiMessage, AiProvider } from '../../common/interfaces/ai.interface.js';
import { MessageRole } from '../../generated/prisma/enums.js';

@Injectable()
export class OpenAiProvider implements AiProvider {
  private readonly client: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.client = new OpenAI({
      apiKey: this.configService.getOrThrow<string>('OPENAI_API_KEY'),
      timeout: 30_000,
    });

    this.model = this.configService.getOrThrow<string>('OPENAI_MODEL');
  }
  async *stream(messages: AiMessage[]): AsyncIterable<string> {
    const input = messages.map(message => ({
      role: this.mapRole(message.role),
      content: message.content,
    }));
    const stream = await this.client.responses.create({
      model: this.model,
      input,
      stream: true,
    });

    for await (const event of stream) {
      if (event.type === 'response.output_text.delta') {
        yield event.delta;
      }
    }
  }

  private mapRole(role: MessageRole): 'user' | 'assistant' | 'system' {
    switch (role) {
      case MessageRole.USER:
        return 'user';

      case MessageRole.ASSISTANT:
        return 'assistant';

      case MessageRole.SYSTEM:
        return 'system';
    }
  }
}
