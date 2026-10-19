import { MessageRole } from '../../generated/prisma/enums.js';

export interface AiMessage {
  role: MessageRole;
  content: string;
}

export interface AiProvider {
  stream(messages: AiMessage[]): AsyncIterable<string>;
}
