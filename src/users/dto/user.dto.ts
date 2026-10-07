import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class UserDto {
  @ApiProperty({ type: Number, description: 'User id', example: 1 })
  @IsNumber()
  id: number;

  @ApiProperty({ type: String, description: 'user email', example: 'john_doe@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiProperty({ type: String, description: 'password' })
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiProperty({ type: String, description: 'first name', example: 'John' })
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty({ type: String, description: 'last name', example: 'Doe' })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({ type: String, example: '2026-10-06T06:54:12.345Z', format: 'date-time' })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ type: String, example: '2026-10-06T06:54:12.345Z', format: 'date-time' })
  @IsDateString()
  updateddAt: string;
}
