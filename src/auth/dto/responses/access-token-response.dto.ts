import { ApiProperty } from '@nestjs/swagger';

export class AccessTokenResponse {
  @ApiProperty({ type: String, example: 'hash' })
  access_token: string;
}
