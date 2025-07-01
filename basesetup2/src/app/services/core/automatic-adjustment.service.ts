import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
/**
 * service for managing user's form auto adjustment
 * auto adjustment is weather to show filter after search or collapse it
 */
export class AutomaticAdjustmentService {
  http = inject(HttpClient);
  cookieService = inject(CookieService);

  getData(formid: any): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.AUTO_ADJUSTMENT.GET
    }`;

    const body = {
      USERID: JSON.parse(this.cookieService.get('user') ?? '').userid,
      FORMID: formid,
    };
    return this.http.post(url, body);
  }

  savechanges(formid: any, pnlheightkbn: string): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.AUTO_ADJUSTMENT.SAVE
    }`;

    const body = {
      USERID: JSON.parse(this.cookieService.get('user') ?? '').userid,
      FORMID: formid,
      PNLHEIGHTKBN: pnlheightkbn,
    };
    return this.http.post(url, body);
  }

  async GetAutoAdjustmenData(formid: string): Promise<string> {
    // always use try..catch when using lastValueFrom and firstValueFrom
    try {
      const res = await lastValueFrom(this.getData(formid));
      if (res.Code === 200) {
        return res.Data.AdjustMentData.PNLHEIGHTKBN;
      }
      return '1'; // Default value for other cases
    } catch (error) {
      return '1';
    }
  }
}
