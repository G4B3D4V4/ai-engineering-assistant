import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsDate, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from 'class-validator';

export class ConversationDto {
  @ApiProperty({ type: Number, description: 'Conversation ID', example: 1 })
  @IsNotEmpty()
  @IsNumber()
  id: number;

  @ApiPropertyOptional({
    type: String,
    description: 'Conversation title',
    example: 'Build dto',
  })
  @IsString()
  @MaxLength(100)
  @IsOptional()
  title?: string | null;

  @ApiProperty({ type: Number, description: 'User ID', example: 2 })
  @IsNotEmpty()
  @IsNumber()
  userId: number;

  @ApiProperty({ type: Date, example: '2026-10-06T06:54:12.345Z', format: 'date-time' })
  @IsDate()
  createdAt: Date;

  @ApiProperty({ type: Date, example: '2026-10-06T06:54:12.345Z', format: 'date-time' })
  @IsDate()
  updatedAt: Date;
}
