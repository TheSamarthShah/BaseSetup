import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoint';
import { firstValueFrom, Observable } from 'rxjs';
import { FILTER } from '../../model/core/filter.type';
import { CookieService } from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root',
})
export class ConditionSettingDisplayService {
  http = inject(HttpClient);
  cookieService = inject(CookieService);

  /**
   * fetches the list of settings whcih can be shown to the user
   * @param conditionnm for filtering the list
   * @param accesskbn for filtering the list (1: private, 2:public)
   * @param usernm for filtering the list
   * @param formid for filtering the list
   * @returns 
   */
  getConditionSettings(
    conditionnm: string,
    accesskbn: string[],
    usernm: string,
    formid: string
  ): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.CONDITION_SETTING.GET_1
    }`;
    const body = {
      Conditionnm: conditionnm,
      Formid: formid,
      Usernm: usernm,
      Loginuserid: JSON.parse(this.cookieService.get('user') ?? '').userid,
      Accesskbn: accesskbn.map((item) => `'${item}'`).join(','),
    };
    return this.http.post(url, body);
  }

  /**
   * 
   * @param conditionno is unique identified for condition setting
   * @param conditionnm
   * @param formid 
   * @param accesskbn 
   * @param searchCols is data to be saved
   * @returns 
   */
  saveConditionSetting(
    conditionno: string,
    conditionnm: string,
    formid: string,
    accesskbn: string,
    searchCols: Array<FILTER>
  ): Observable<any> {
    const searchData = searchCols.map((d) => ({
      Columnname: d.name,
      Visible: d.visible ? '1' : '0',
      Fromvalue: d.data_type !== '4' ? d.value_from : null,
      Tovalue: d.data_type !== '4' ? d.value_to : null,
      Combovalue: d.data_type !== '4' ? d.match_type : null,
      Checkvalue:
        d.data_type === '4'
          ? d.value_from
              .toString()
              .split(',')
              .map((item) => `'${item}'`)
              .join(',')
          : null,
      Datatype: d.data_type,
    }));

    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.CONDITION_SETTING.SAVE_1
    }`;
    const body = {
      Conditionno: conditionno,
      Conditionnm: conditionnm,
      Formid: formid,
      Userid: JSON.parse(this.cookieService.get('user') ?? '').userid,
      Accesskbn: accesskbn,
      ColumnsData: searchData,
    };

    return this.http.post(url, body);
  }

  /**
   * to get the data of desiered condition setting
   * @param conditionno is the unique identifier to fetch the setting
   * @returns 
   */
  getConditionSetting(conditionno: string): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.CONDITION_SETTING.GET_2
    }`;
    const body = {
      Conditionno: conditionno,
    };
    return this.http.post(url, body);
  }

  deleteConditionSetting(conditionno: string): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.CONDITION_SETTING.DELETE
    }`;
    const body = {
      Conditionno: conditionno,
    };
    return this.http.post(url, body);
  }

  /**
   * used to apply the last condtion setting used by the user for that perticular form
   * this method will be executed when form component's ngOnInit
   * @param userid for fetching relevent data
   * @param formid for fetching relevent data
   * @param searchList for setting the data
   * @returns the searchList after modifying it with previously applied values
   */
  async getLastConditionSetting(
    userid: string,
    formid: string,
    searchList: Array<FILTER>
  ): Promise<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.CONDITION_SETTING.GET_3
    }`;
    const body = {
      Userid: userid,
      Formid: formid,
    };

    try {
      const res: any = await firstValueFrom(this.http.post(url, body));
      if (res.Code === 200) {
        const lastConditionSettingData = res.Data.ConditionSettingData;
        for (let indx = 0; indx < lastConditionSettingData.length; indx++) {
          const searchColsObj = searchList.find(
            (d) => d.name === lastConditionSettingData[indx].COLUMNNAME
          );
          if (searchColsObj) {
            searchColsObj.value_from =
              lastConditionSettingData[indx].CHECKVALUE !== null
                ? lastConditionSettingData[indx].CHECKVALUE.split(',').map(
                    (item: string) => item.replace(/'/g, '').trim()
                  )
                : lastConditionSettingData[indx].FROMVALUE !== null
                ? lastConditionSettingData[indx].FROMVALUE
                : '';
            searchColsObj.value_to =
              lastConditionSettingData[indx].TOVALUE !== null
                ? lastConditionSettingData[indx].TOVALUE
                : '';
            searchColsObj.visible =
              lastConditionSettingData[indx].VISIBLE === '1';
            searchColsObj.match_type =
              lastConditionSettingData[indx].COMBOVALUE;
          }
        }
        return searchList;
      } else {
        return [];
      }
    } catch (err) {
      return [];
    }
  }

  updateLastConditionno(
    conditionno: string,
    userid: string,
    formid: string
  ): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.CONDITION_SETTING.SAVE_2
    }`;
    const body = {
      Userid: userid,
      Formid: formid,
      Conditionno: conditionno,
    };
    return this.http.post(url, body);
  }
}
