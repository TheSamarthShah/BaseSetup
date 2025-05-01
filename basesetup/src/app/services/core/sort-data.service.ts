import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoint';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SortDataService {
  http = inject(HttpClient);

  getSortingData(UserId: string, FormId: string): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.SORT_DATA.GET}`;
    const body = [UserId, FormId];

    return this.http.post(url, body);
  }

  saveSortingData(sortingData: any): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.SORT_DATA.SAVE}`;
    return this.http.post(url, sortingData);
  }
}
