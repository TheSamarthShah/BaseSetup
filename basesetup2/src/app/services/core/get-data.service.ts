import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { FILTER } from '../../model/core/filter.type';
import { API_ENDPOINTS } from '../../shared/api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class GetDataService {
  http = inject(HttpClient);

  createBodyObj(filterData: Array<FILTER>): any {
    const body: any = {};

    filterData.forEach((filter) => {
      if (filter.match_type === '10' || filter.match_type === '11') {
        body[filter.name] = {
          From: filter.value_from ?? '',
          To: filter.value_to ?? '',
          Type: filter.match_type,
        };
      } else {
        if (
          filter.data_type === '1' ||
          filter.data_type === '2' ||
          filter.data_type === '3'
        ) {
          if (
            (filter.value_from !== '' && filter.value_from !== null) ||
            (filter.value_to !== '' && filter.value_to !== null)
          ) {
            body[filter.name] = {
              From: filter.value_from,
              To: filter.value_to,
              Type: filter.showMatchType ? filter.match_type : '2',
            };
          }
        } else if (filter.data_type === '4') {
          if (Array.isArray(filter.value_from)) {
            body[filter.name] = filter.value_from
              .map((item: string) => `'${item}'`)
              .join(',');
          }
        } else if (filter.data_type === '6') {
          body[filter.name] = filter.value_from;
        }
      }
    });

    return body;
  }

  getData(
    filterData: Array<FILTER>,
    userId: string,
    formId: string,
    getUrl: string
  ): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + getUrl}`;
    const body = this.createBodyObj(filterData);
    body.UserId = userId;
    body.FormId = formId;
    return this.http.post(url, body);
  }

  /**
   *
   * @param filterData for filtering data
   * @param userId for applying user sepcific things like sorting data
   * @param formId for applying user sepcific things like sorting data
   * @param getUrl form's get method api endpoint
   * @param offset no. of rows to skip
   * @param rows no. of rows to fetch
   * @returns
   */
  getDataOfPage(
    filterData: Array<FILTER>,
    userId: string,
    formId: string,
    getUrl: string,
    offset: number,
    rows: number | null
  ): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + getUrl}`;
    const body = this.createBodyObj(filterData);

    body.Offset = offset;
    body.Rows = rows;
    body.UserId = userId;
    body.FormId = formId;

    return this.http.post(url, body);
  }
}
