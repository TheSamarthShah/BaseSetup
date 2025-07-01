import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { FILTER } from '../../model/core/filter.type';
import { GetDataService } from './get-data.service';
import { MessageService } from 'primeng/api';
import { gridColumnHeader } from '../../model/core/gridColumnHeader.type';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { INFOMSG } from '../../shared/messages';

@Injectable({
  providedIn: 'root',
})
export class SaveAsService {
  //services injection
  messageService = inject(MessageService); //for displaying Toast messages
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

    return this.http.post(apiUrl, body, { responseType: 'blob' }).pipe(
      map((blob) => {
        // if the file is empty then show message and throw error so that file wont be downloaded
        // Need to do the check here because for blob data we need to specify { responseType: 'blob' } and if we do that we can't pass json.
        // If we pass json then .subscribe will give error.
        if (!blob || blob.size === 0) {
          this.messageService.add({
            severity: 'info',
            summary: INFOMSG.I0001,
          });
          throw new Error('No data received from server');
        }
        return blob;
      })
    );
  }
}
