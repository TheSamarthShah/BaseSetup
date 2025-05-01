import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from '../../shared/constants/api-endpoint';
import { refScreenRequest } from '../../model/core/refScreenRequest.type';
import { refScreenColumns } from '../../model/core/refScreenColumns.type';

@Injectable({
  providedIn: 'root',
})
export class ReferenceScreenService {
  isVisible = signal<boolean>(false);

  // Hold reference screen related inputs
  tableName = signal<string>('');
  tableJPName = signal<string>('');
  formId = signal<string>('');
  columns = signal<refScreenColumns[]>([]); // columns data for the reference screen
  refForColumn = signal<string>(''); // stores the main screen column name for which the reference screen
  selectedValue = signal<string | string[]>(''); // current value for/of main screen column
  /**
   * only used for grids and toroku form.
   * It holds primary key data of current row to identify which row to set the value
   */
  pkData = signal<{ [key: string]: any }>({});
  /**
   * used to fetch data without opening the reference screen
   * reference button will have it as input and when that changes, that will update the service data(here)
   * when gridRefData in service(here) changes then it will execute code for fetching data in reference dialog component whcih will set the data.
   */
  gridRefData = signal<{
    tableName: string;
    columns: refScreenColumns[];
    pkData: { [key: string]: any };
    refForColumn: string;
    selectedValue: string | string[];
  } | null>(null);

  //For Output
  referenceSelected = signal<{
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
    pkData: { [key: string]: any };
  }>({
    refForColumn: '',
    selectedValue: '',
    mainScreenColumnValues: [],
    pkData: {},
  });

  private apiUrl = API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.REFERENCE.GET;

  constructor(private http: HttpClient) {}

  getReferenceScreenData(data: refScreenRequest): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  showRefScreen() {
    this.isVisible.set(true);
  }

  closeRefScreen() {
    this.isVisible.set(false);
  }

  updateReferenceData(data: {
    tableName: string;
    tableJPName: string;
    formId: string;
    columns: refScreenColumns[];
    refForColumn: string;
    selectedValue: string | string[];
    pkData: { [key: string]: any };
    gridRefData: {
      tableName: string;
      columns: refScreenColumns[];
      pkData: { [key: string]: any };
      refForColumn: string;
      selectedValue: string | string[];
    } | null;
  }) {
    this.tableName.set(data.tableName);
    this.tableJPName.set(data.tableJPName);
    this.formId.set(data.formId);
    this.columns.set(data.columns);
    this.refForColumn.set(data.refForColumn);
    this.selectedValue.set(data.selectedValue);
    this.pkData.set(data.pkData);
    this.gridRefData.set(data.gridRefData);
  }
}
