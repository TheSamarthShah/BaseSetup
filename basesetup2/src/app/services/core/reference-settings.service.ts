import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class ReferenceSettingsService {
  http = inject(HttpClient);

  /**
   * Converts data input to api's S_SET008Model shape
   * @param data
   */
  private createS_SET008Model(data: any): any {
    return {
      USERID: data.UserId ?? '',
      FORMID: data.FormId ?? '',
      TABLENAME: data.TableName ?? '',
      INITIALSEARCHKBN: data.InitialSearchKBN ?? null,
    };
  }

  /**
   * Makes POST call to get reference setting
   * @param data
   */
  getReferenceSetting(data: any): Observable<any> {
    const apiUrl = `${API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.REFERENCE_SETTING.GET}`;
    const body = this.createS_SET008Model(data);
    return this.http.post(apiUrl, body);
  }

  /**
   * Makes POST call to save reference setting
   * @param data
   */
  saveReferenceSetting(data: any): Observable<any> {
    const apiUrl = `${API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.REFERENCE_SETTING.SAVE}`;
    const body = this.createS_SET008Model(data);
    return this.http.post(apiUrl, body);
  }
}
