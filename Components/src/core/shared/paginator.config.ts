import { MatPaginatorIntl } from '@angular/material/paginator';
import { Injectable } from '@angular/core';

@Injectable()
export class CustomPaginator extends MatPaginatorIntl {
  override itemsPerPageLabel = '';//'表示件数:';
  override nextPageLabel = '次のページ';
  override previousPageLabel = '前のページ';
  override firstPageLabel = '最初のページ';
  override lastPageLabel = '最後のページ';

  override getRangeLabel = (page: number, pageSize: number, length: number) => {
    if (length === 0 || pageSize === 0) {
      return `0 件中 0 件を表示`;
    }
    
    length = Math.max(length, 0);
    const startIndex = page * pageSize;
    const endIndex = Math.min(startIndex + pageSize, length);
    const totalPages = Math.ceil(length / pageSize);
    
    // Current page is page + 1 because page index starts at 0
    return `${startIndex + 1}–${endIndex} 件 / 総計 ${length} 件 (${page + 1} / ${totalPages})`;
  };
}