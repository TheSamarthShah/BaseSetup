import { inject, Injectable } from '@angular/core';
import { GRID } from '../../model/core/grid.type';
import { FILTER } from '../../model/core/filter.type';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { CookieService } from 'ngx-cookie-service';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { TOROKU } from '../../shared/jp-text';
import { API_ENDPOINTS } from '../../shared/api-endpoint';

@Injectable({
  providedIn: 'root',
})
export class ActyCommonService {
  http = inject(HttpClient);
  //for managing session through cookies
  cookieService = inject(CookieService);
  router = inject(Router);

  textContent = TOROKU;

  //whether the device is touch based or not
  isTouchDevice(): boolean {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  }

  /**
   * Converts the given input to a UTC ISO date string.
   *
   * @param input - A Date object or a date string.
   * @param includeTime - Whether to include the time component in the output. Defaults to false.
   * @returns A UTC ISO date string or null if input is invalid.
   */
  getUtcIsoDate = (input: any, includeTime: boolean = false): string | null => {
    if (!input) return null;

    let date: Date;

    if (input instanceof Date) {
      date = input;
    } else {
      date = new Date(input);
      // Return null if the date is invalid
      if (isNaN(date.getTime())) return null;
    }

    // Extract the UTC-relevant parts
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (includeTime) {
      // Extract time components if needed
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const millis = date.getMilliseconds();

      // Create a new UTC date with time
      const utcDate = new Date(
        Date.UTC(year, month, day, hours, minutes, seconds, millis)
      );
      return utcDate.toISOString();
    } else {
      // Create a new UTC date without time (00:00:00)
      const utcDate = new Date(Date.UTC(year, month, day));
      return utcDate.toISOString();
    }
  };

  //Transform data grid to filter list
  transformDataGridToFilterList(dataGrid: Array<GRID>): Array<FILTER> {
    return dataGrid
      .filter((d) => d.searchVisible) // Filter items where searchVisible is true
      .map((item) => ({
        name: item.name,
        displayName: item.displayName,
        colMetadataKey: {
          tableName: item.tableName,
          columnName: item.name,
        },
        visible: true,
        required: item.searchRequired ? true : false,
        value_from:
          item.dataType === '4' && item.memberList?.length
            ? item.memberList.map((m) => m.code)
            : item.dataType === '6' && item.memberList?.length ? item.memberList[0].code : '',
        value_to: '',
        data_type: item.dataType,
        match_type: item.dataType === '1' ? '4' : '1',
        showMatchType : item.showMatchType ?? true,
        memberList: item.memberList,
        dateFormat: item.dateFormat,
        isReferenceScreen: item.isReferenceScreen,
        refTableName: item.refTableName,
        refQueryID: item.refQueryID,
        refTableJPName: item.refTableJPName,
        refColumns: item.refColumns,
      }));
  }

  //According to screen size set the splitter toggled height
  getSplitterToggleSizes(): [number, number] {
    const screenHeight = window.innerHeight;
    if (screenHeight <= 500) return [25, 75];
    if (screenHeight <= 600) return [30, 70];
    if (screenHeight <= 700) return [24, 76];
    if (screenHeight <= 800) return [20, 80];
    return [14, 86];
  }

  //According to screen size set the splitter toggled height
  getSplitterToggleSizesWithoutButtons(): [number, number] {
    const screenHeight = window.innerHeight;
    if (screenHeight <= 500) return [19, 51];
    if (screenHeight <= 600) return [24, 76];
    if (screenHeight <= 700) return [18, 82];
    if (screenHeight <= 800) return [14, 86];
    return [8, 92];
  }

  getTorokuModeTitle(mode: number): string {
    let label = '';
    switch (mode) {
      case 0:
        label = this.textContent.REF;
        break;
      case 1:
        label = this.textContent.ADD;
        break;
      case 2:
        label = this.textContent.UPDATE;
        break;
      case 4:
        label = this.textContent.DELETE_BTN;
        break;
      case 5:
        label = this.textContent.COPY;
        break;
      default:
        label = '';
    }
    return label;
  }

  getRefreshedJWTToken(
    userId: string,
    refreshToken: string
  ): Observable<string> {
    const url = `${API_ENDPOINTS.BASE + API_ENDPOINTS.GETREFRESHEDJWTTOKEN}`;
    const formId = this.getCurrentFormId() ?? '';
    const body = [userId, formId, refreshToken];

    return this.http.post<any>(url, body).pipe(
      map((res) => {
        if (res.Code === 200) {
          const newToken = res.Data.jwttoken;

          // Save token in cookie
          this.cookieService.set('jwttoken', newToken, {
            path: '/',
            sameSite: 'Lax',
            secure: true,
          });

          return newToken;
        } else {
          throw new Error('Failed to refresh token');
        }
      })
    );
  }

  getCurrentFormId(): string | null {
    const route = this.router.routerState.snapshot.root;
    const deepest = this.getDeepestChild(route);
    return deepest.data['formId'] || null;
  }

  private getDeepestChild(
    route: ActivatedRouteSnapshot
  ): ActivatedRouteSnapshot {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  formatDateToCustomString(
    dateInput: Date | string,
    includeTime: boolean = false
  ): string {
    let date: Date;
    if (typeof dateInput === 'string') {
      date = new Date(dateInput);
    } else {
      date = dateInput;
    }

    if (isNaN(date.getTime())) {
      return ''; // or any fallback you prefer
    }

    const pad = (n: number) => n.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());

    if (!includeTime) {
      return `${year}/${month}/${day}`;
    }

    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());
    
    return `${year}/${month}/${day} ${hours}:${minutes}:${seconds}`;
  }
}
