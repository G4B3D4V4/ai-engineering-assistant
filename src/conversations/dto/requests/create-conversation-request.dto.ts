import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class CreateConversationRequest {
  @ApiProperty({
    type: String,
    description: 'Message content',
    example: 'Explain Node.js event loop',
  })
  @IsString()
  @Matches(/\S/, {
    message: 'Message must contain at least one non-whitespace character',
  })
  @MaxLength(10000)
  message: string;
}
