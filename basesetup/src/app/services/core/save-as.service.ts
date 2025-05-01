import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoint';
import { FILTER } from '../../model/core/filter.type';
import { gridColumnHeader } from '../../model/core/gridColumnHeader.type';
import { GetDataService } from './get-data.service';

@Injectable({
  providedIn: 'root',
})
export class SaveAsService {
  http = inject(HttpClient);

  getDataService = inject(GetDataService);

  getDateFormat(date: any) {
    const dateObj = new Date(date);
    return (
      dateObj.getFullYear() +
      '/' +
      (Number(dateObj.getMonth()) + 1).toString().padStart(2, '0') +
      '/' +
      dateObj.getDate().toString().padStart(2, '0')
    );
  }

  /**
   * 
   * @param filterData for search data which is used under the hood
   * @param gridColumnNameAndDisplayNameList for exporting only the visible columns
   * @param fileType for deciding weather to export csv or txt
   * @param exportURL is form's export url
   * @param userId for fetching user wise sorting data for current form
   * @param formId for fetching user wise sorting data for current form
   * @returns 
   */
  exportData(
    filterData: Array<FILTER>,
    gridColumnNameAndDisplayNameList: Array<gridColumnHeader>,
    fileType: string,
    exportURL: string,
    userId: string,
    formId: string
  ): Observable<Blob> {
    const apiUrl = `${API_ENDPOINTS.BASE + exportURL}`;
    const Searchdata = this.getDataService.createBodyObj(filterData);

    Searchdata.UserId = userId;
    Searchdata.FormId = formId;

    const body = {
      searchData: Searchdata,
      gridColumnNameAndDisplayNameList: gridColumnNameAndDisplayNameList,
      fileType: fileType,
    };

    return this.http
      .post(apiUrl, body, {
        responseType: 'blob',
        observe: 'response',
      })
      .pipe(
        map((response: { status: number; body: any }) => {
          if (response.status === 204) {
            throw { status: 204, message: 'No data found' };
          }
          if (!response.body) {
            throw new Error('Empty response body');
          }
          return response.body;
        }),
        catchError((error) => {
          if (error.status === 204) {
            throw { status: 204, message: error.message || 'No data found' };
          }
          throw { status: error.status || 500, message: 'Export failed' };
        })
      );
  }
}
