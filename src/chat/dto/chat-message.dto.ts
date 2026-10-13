import { IsInt, IsString, Matches, MaxLength, Min } from 'class-validator';

export class ChatMessageDto {
  @IsInt()
  @Min(1)
  conversationId: number;

  @IsString()
  @Matches(/\S/, {
    message: 'Content must contain at least one non-whitespace character',
  })
  @MaxLength(10000)
  content: string;
}
