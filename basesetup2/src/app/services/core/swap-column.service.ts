import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { firstValueFrom, Observable } from 'rxjs';
import { SwapColumn } from '../../model/core/swapColumn.type';

@Injectable({
  providedIn: 'root',
})
export class SwapColumnService {
  http = inject(HttpClient);

  getSwapData(UserId: string, FormId: string): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.SWAP_COLUMN_DATA.GET
    }`;
    const body = [UserId, FormId];
    return this.http.post(url, body);
  }

  savechanges(formid: any, SwapData: Array<SwapColumn>): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.SWAP_COLUMN_DATA.SAVE
    }`;

    return this.http.post(url, SwapData);
  }

  /**
   * 
   * @param userid 
   * @param formid 
   * @returns promise of swap data fetched from getSwapData
   */
  async getSwapDataOfForm(
    userid: string,
    formid: string
  ): Promise<Array<SwapColumn>> {
    // always use try..catch when using lastValueFrom and firstValueFrom
    try {
      const res = await firstValueFrom(this.getSwapData(userid, formid));
      if (res.Data?.ColumnSwapData?.length > 0) {
        return res.Data.ColumnSwapData;
      } else {
        return [];
      }
    } catch (err) {
      return [];
    }
  }
}
