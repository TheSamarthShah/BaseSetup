import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { SaveData } from '../../model/core/saveData.type';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SaveDataService {
  http = inject(HttpClient);

  saveData(saveData: SaveData, saveURL: string):Observable<any>{
    const url = `${API_ENDPOINTS.BASE + saveURL}`;
    return this.http.post(url, saveData);
  }
}
