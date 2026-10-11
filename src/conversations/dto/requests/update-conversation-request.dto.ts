import { ApiProperty } from '@nestjs/swagger';
import { IsString, Matches, MaxLength } from 'class-validator';

export class UpdateConversationRequest {
  @ApiProperty({
    type: String,
    example: 'Node.js Event Loop',
    maxLength: 100,
  })
  @IsString()
  @Matches(/\S/, {
    message: 'Title must contain at least one non-whitespace character',
  })
  @MaxLength(100)
  title: string;
}
