import { ApiProperty } from '@nestjs/swagger';
import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { MessageRole } from '../../generated/prisma/enums.js';

export class MessageDto {
  @ApiProperty({ type: Number, description: 'Message ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiProperty({ enum: MessageRole, description: 'Message role', example: MessageRole.USER })
  @IsEnum(MessageRole)
  @IsNotEmpty()
  role: MessageRole;

  @ApiProperty({
    type: String,
    description: 'Message content',
    example: 'Explain Node.js event loop',
  })
  @IsString()
  @Matches(/\S/, {
    message: 'Content must contain at least one non-whitespace character',
  })
  @MaxLength(10000)
  content: string;

  @ApiProperty({ type: Number, description: 'Conersation ID', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  conversationId: number;

  @ApiProperty({ type: Date, example: '2026-10-06T06:54:12.345Z', format: 'date-time' })
  @IsDate()
  createdAt: Date;
}
