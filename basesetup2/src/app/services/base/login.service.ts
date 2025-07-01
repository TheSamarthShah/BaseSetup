import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  //injecting http service to make API calls
  http = inject(HttpClient);

  //sending request to API for login
  login(userid: string, password: string): Observable<any> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.LOGIN}`;
    const body = {
      Userid: userid,
      Password: password,
    };

    return this.http.post(url, body);
  }
}
