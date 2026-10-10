import { PaginatorDto } from '../dtos/paginator.dto.js';

interface GeneratePaginatorParams {
  totalCount: number;
  currentPage: number;
  limit: number;
}

export function generatePaginator({
  totalCount,
  currentPage,
  limit,
}: GeneratePaginatorParams): PaginatorDto {
  const pagesCount = Math.ceil(totalCount / limit);
  const numbersCount = 5;

  let pages: string[] = [];

  if (pagesCount === 0) {
    return {
      currentPage,
      pagesCount: 0,
      nextPage: null,
      prevPage: null,
      pages: [],
      totalCount,
    };
  }

  if (pagesCount - numbersCount <= 2) {
    pages = Array.from({ length: pagesCount }, (_, i) => (i + 1).toString());
  } else {
    pages.push('1');

    const startPage = currentPage - Math.floor(numbersCount / 2);

    if (startPage >= 3) {
      pages.push(startPage === 3 ? '2' : '...');
    }

    pages = pages.concat(
      Array.from({ length: numbersCount }, (_, i) => {
        if (startPage <= 2) {
          return (i + 2).toString();
        }

        if (startPage >= pagesCount - numbersCount) {
          return (i + pagesCount - numbersCount).toString();
        }

        return (i + startPage).toString();
      }),
    );

    const lastPage = Number(pages.at(-1));

    if (lastPage + 1 < pagesCount) {
      if (pagesCount - lastPage === 2) {
        pages.push((pagesCount - 1).toString());
      } else {
        pages.push('...');
      }
    }

    pages.push(pagesCount.toString());
  }

  return {
    currentPage,
    pagesCount,
    nextPage: currentPage < pagesCount ? currentPage + 1 : null,
    prevPage: currentPage > 1 ? currentPage - 1 : null,
    pages,
    totalCount,
  };
}
