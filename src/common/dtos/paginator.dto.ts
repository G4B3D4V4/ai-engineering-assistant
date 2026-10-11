import { ApiProperty } from '@nestjs/swagger';

export class PaginatorDto {
  @ApiProperty({ type: Number, description: 'Current page', example: 2 })
  currentPage: number;

  @ApiProperty({ type: Number, description: 'Total pages', example: 10 })
  pagesCount: number;

  @ApiProperty({ type: Number, description: 'Next page', nullable: true, example: 3 })
  nextPage: number | null;

  @ApiProperty({ type: Number, description: 'Previous page', nullable: true, example: 1 })
  prevPage: number | null;

  @ApiProperty({ type: [String], description: 'Pages array' })
  pages: string[];

  @ApiProperty({ type: Number, description: 'Total count', example: 100 })
  totalCount: number;
}
