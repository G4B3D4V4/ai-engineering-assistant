import { Test, TestingModule } from '@nestjs/testing';
import { aiProviderMock } from '../../test/mocks/providers/ai-provider.mock.js';
import { AI_PROVIDER } from '../common/consts/ai.constants.js';
import { AiMessage } from '../common/interfaces/ai.interface.js';
import { MessageRole } from '../generated/prisma/enums.js';
import { AiService } from './ai.service.js';

describe('AiService', () => {
  let service: AiService;

  beforeEach(async () => {
    vi.resetAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AiService,
        {
          provide: AI_PROVIDER,
          useValue: aiProviderMock,
        },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('stream', () => {
    it('should delegate streaming to AI provider', async () => {
      const messages: AiMessage[] = [
        {
          role: MessageRole.USER,
          content: 'Hello',
        },
      ];

      async function* mockStream() {
        yield 'Hello';
        yield ' from';
        yield ' AI';
      }

      aiProviderMock.stream.mockReturnValue(mockStream());

      const chunks: string[] = [];

      for await (const chunk of service.stream(messages)) {
        chunks.push(chunk);
      }

      expect(aiProviderMock.stream).toHaveBeenCalledWith(messages);

      expect(chunks).toEqual(['Hello', ' from', ' AI']);
    });
  });
});
