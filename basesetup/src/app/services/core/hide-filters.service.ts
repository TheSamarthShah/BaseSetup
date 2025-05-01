import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable, lastValueFrom } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoint';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})

export class HideFiltersService {

    http = inject(HttpClient);
    cookieService = inject(CookieService);

    getData(formId:any): Observable<any> {
        const url = `${
            API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.HIDE_FILTER.GET
        }`;
        const body =[JSON.parse(this.cookieService.get('user') ?? '').userid,formId];       
        return this.http.post(url,body);
    }

    saveChange(formId:any,hidefilterkbn:string): Observable<any>{
        const url = `${
            API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.HIDE_FILTER.SAVE
        }`;
        const body = [JSON.parse(this.cookieService.get('user') ?? '').userid,formId,hidefilterkbn]
                 
        return this.http.post(url, body);
    }

    async GetHideFilterData(formId:string):Promise<string>{
        const res = await lastValueFrom(this.getData(formId));
        if(res.Code === 200){
            return res.Data.HideFilterData.HIDEFILTERKBN;
        }else if(res.Code === 201){
            return '1';
        }
        return '1';   
    }
}
