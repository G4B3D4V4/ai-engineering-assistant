import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Length, Matches, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    example: 'john.doe@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    example: 'StrongPass1!',
    minLength: 8,
    maxLength: 64,
    description:
      'Must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(64)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).+$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
  })
  password: string;
  @ApiProperty({
    example: 'John',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @Length(2, 30)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    minLength: 2,
    maxLength: 30,
  })
  @IsString()
  @Length(2, 30)
  lastName: string;
}
