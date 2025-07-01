import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { refScreenColumns } from '../../model/core/refScreenColumns.type';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { refScreenRequest } from '../../model/core/refScreenRequest.type';

@Injectable({
  providedIn: 'root',
})
export class ReferenceScreenService {
  http = inject(HttpClient);

  isVisible = signal<boolean>(false);
  // Hold reference screen related inputs
  tableName = signal<string>('');
  queryID = signal<string>('');
  tableJPName = signal<string>('');
  formId = signal<string>('');
  columns = signal<refScreenColumns[]>([]); // columns data for the reference screen
  refForColumn = signal<string>(''); // stores the main screen column name for which the reference screen
  selectedValue = signal<string | string[]>(''); // current value for/of main screen column
  // if the column name with its value is given then it'll use it every time. The value comes from form.
  defaultValue = signal<{ [key: string]: any }>({});
  /**
   * only used for grids and toroku form.
   * It holds primary key data of current row to identify which row to set the value
   */
  rowId = signal<number>(-1);
  /**
   * used to fetch data without opening the reference screen
   * reference button will have it as input and when that changes, that will update the service data(here)
   * when gridRefData in service(here) changes then it will execute code for fetching data in reference dialog component whcih will set the data.
   */
  gridRefData = signal<{
    tableName: string;
    queryID: string;
    columns: refScreenColumns[];
    rowId: number;
    refForColumn: string;
    selectedValue: string | string[];
    defaultValue: { [key: string]: any };
  } | null>(null);

  //For Output
  referenceSelected = signal<{
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
    rowId: number;
  }>({
    refForColumn: '',
    selectedValue: '',
    mainScreenColumnValues: [],
    rowId: -1,
  });

  private apiUrl: string =
    API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.REFERENCE.GET;

  getReferenceScreenData(data: refScreenRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  showRefScreen(): void {
    this.isVisible.set(true);
  }

  closeRefScreen(): void {
    this.isVisible.set(false);
  }

  updateReferenceData(data: {
    tableName: string;
    queryID: string;
    tableJPName: string;
    formId: string;
    columns: refScreenColumns[];
    refForColumn: string;
    selectedValue: string | string[];
    defaultValue: { [key: string]: any };
    rowId: number;
    gridRefData: {
      tableName: string;
      queryID: string;
      columns: refScreenColumns[];
      rowId: number;
      refForColumn: string;
      selectedValue: string | string[];
      defaultValue: { [key: string]: any };
    } | null;
  }): void {
    this.tableName.set(data.tableName);
    this.queryID.set(data.queryID);
    this.tableJPName.set(data.tableJPName);
    this.formId.set(data.formId);
    this.columns.set(data.columns);
    this.refForColumn.set(data.refForColumn);
    this.selectedValue.set(data.selectedValue);
    this.defaultValue.set(data.defaultValue);
    this.rowId.set(data.rowId);
    this.gridRefData.set(data.gridRefData);
  }
}
