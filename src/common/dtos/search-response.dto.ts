import { ApiProperty } from '@nestjs/swagger';
import { PaginatorDto } from './paginator.dto.js';

export class SearchResponse {
  @ApiProperty()
  data: unknown;

  @ApiProperty({ type: PaginatorDto })
  meta: PaginatorDto;
}
