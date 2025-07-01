import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  effect,
  HostListener,
  inject,
  OnInit,
  signal,
  ViewChild,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { ReferenceScreenService } from '../../../services/core/reference-screen.service';
import { FILTER } from '../../../model/core/filter.type';
import { refScreenColumns } from '../../../model/core/refScreenColumns.type';
import { MessageService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { refScreenRequest } from '../../../model/core/refScreenRequest.type';
import { Checkbox } from 'primeng/checkbox';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { ProgressSpinner } from 'primeng/progressspinner';
import { CONFIG } from '../../../shared/config';
import {
  FILTER_TEXT,
  REFERENCE_SCREEN,
  REFERENCE_SETTING,
} from '../../../shared/jp-text';
import { INFOMSG, WARNMSG } from '../../../shared/messages';
import { DatePickerModule } from 'primeng/datepicker';
import { SplitButtonModule } from 'primeng/splitbutton';
import { MenuModule } from 'primeng/menu';
import { CommonModule } from '@angular/common';
import { SplitterModule } from 'primeng/splitter';
import { ReferenceInitialSearchkbnComponent } from '../reference-initial-searchkbn/reference-initial-searchkbn.component';
import { DividerModule } from 'primeng/divider';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { LoaderComponent } from '../../shared/loader/loader.component';
import { ActyCommonService } from '../../../services/shared/acty-common.service';

@Component({
  selector: 'app-reference-screen-dialog',
  imports: [
    InputText,
    Dialog,
    ButtonModule,
    SelectModule,
    FormsModule,
    Checkbox,
    MaxLengthDirective,
    TableModule,
    MultiSelectModule,
    DatePickerModule,
    SplitButtonModule,
    MenuModule,
    CommonModule,
    SplitterModule,
    ReferenceInitialSearchkbnComponent,
    ProgressSpinner,
    DividerModule,
    LoaderComponent,
  ],
  templateUrl: './reference-screen-dialog.component.html',
  styleUrl: './reference-screen-dialog.component.scss',
})
export class ReferenceScreenDialogComponent implements OnInit, AfterViewInit {
  @ViewChild('dropdownRef') dropdownRef: any;
  @ViewChild('dt') dataTable!: Table;
  @ViewChild('refInitialSearchKBN') refInitialSearchKBN: any;

  referenceScreenService = inject(ReferenceScreenService);
  //for displaying Toast messages
  messageService = inject(MessageService);
  ActyCommonService = inject(ActyCommonService);
  cdr = inject(ChangeDetectorRef);

  pageSize = CONFIG.REFERENCESCREEN.PAGESIZES;
  FilertText: any = FILTER_TEXT;
  textContent: any = REFERENCE_SCREEN;
  ReferenceSettingText: any = REFERENCE_SETTING;

  match_options_string: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: this.FilertText.FILTER_MATCH_CONDITIONS.RANGE },
    { code: '2', name: this.FilertText.FILTER_MATCH_CONDITIONS.EQ },
    { code: '3', name: this.FilertText.FILTER_MATCH_CONDITIONS.NEQ },
    { code: '4', name: this.FilertText.FILTER_MATCH_CONDITIONS.SW },
    { code: '5', name: this.FilertText.FILTER_MATCH_CONDITIONS.NSW },
    { code: '6', name: this.FilertText.FILTER_MATCH_CONDITIONS.EW },
    { code: '7', name: this.FilertText.FILTER_MATCH_CONDITIONS.NEW },
    { code: '8', name: this.FilertText.FILTER_MATCH_CONDITIONS.CON },
    { code: '9', name: this.FilertText.FILTER_MATCH_CONDITIONS.NCON },
    { code: '10', name: this.FilertText.FILTER_MATCH_CONDITIONS.IN },
    { code: '11', name: this.FilertText.FILTER_MATCH_CONDITIONS.INN },
  ];
  match_options_num_date: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: this.FilertText.FILTER_MATCH_CONDITIONS.RANGE },
    { code: '2', name: this.FilertText.FILTER_MATCH_CONDITIONS.EQ },
    { code: '3', name: this.FilertText.FILTER_MATCH_CONDITIONS.NEQ },
    { code: '10', name: this.FilertText.FILTER_MATCH_CONDITIONS.IN },
    { code: '11', name: this.FilertText.FILTER_MATCH_CONDITIONS.INN },
  ];

  tableName: string = '';
  queryID: string = '';
  tableJPName: string = '';
  formId: string = '';
  columns: refScreenColumns[] = [];
  refForColumn: string = '';
  selectedValue: string | string[] = '';
  rowId: number = -1;
  defaultValue: { [key: string]: any } = {};
  // if the column name with its value is given then it'll use it every time. The value comes from form.
  // gridRefData is for setting data without opening reference dialog
  gridRefData: {
    tableName: string;
    queryID: string;
    columns: refScreenColumns[];
    rowId: number;
    refForColumn: string;
    selectedValue: string | string[];
    defaultValue: { [key: string]: any };
  } | null = null;
  isTouchDevice: boolean = this.ActyCommonService.isTouchDevice();

  // signals
  displayInitialSearchKbnDialog = signal<boolean>(false);
  // Component state
  visible = signal(false);
  gridData = signal<any[]>([]);
  searchList = signal<FILTER[]>([]);
  isShowFilter = signal(true);
  // to show increament by 1 this.isLoading.update((n) => n + 1);
  // to hide decreament by 1 till 0 this.isLoading.update((n) => Math.max(n - 1, 0));
  isLoading = signal<number>(0);
  pageSizeDrpDown = signal(this.pageSize[0]);
  rows = signal(this.pageSize[0]);
  isBackgroundLoading = signal<boolean>(false);

  constructor() {
    // save previous to check which variable is changed
    let prev: {
      visible: boolean;
      columns: refScreenColumns[];
      tableName: string;
      queryID: string;
      tableJPName: string;
      formId: string;
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
    } = {
      visible: this.referenceScreenService.isVisible(),
      columns: this.referenceScreenService.columns(),
      tableName: this.referenceScreenService.tableName(),
      queryID: this.referenceScreenService.queryID(),
      tableJPName: this.referenceScreenService.tableJPName(),
      formId: this.referenceScreenService.formId(),
      refForColumn: this.referenceScreenService.refForColumn(),
      selectedValue: this.referenceScreenService.selectedValue() ?? '',
      rowId: this.referenceScreenService.rowId(),
      defaultValue: this.referenceScreenService.defaultValue(),
      gridRefData: this.referenceScreenService.gridRefData(),
    };

    effect(() => {
      // match current state with previous state to check which variable is changed
      const current: {
        visible: boolean;
        columns: refScreenColumns[];
        tableName: string;
        queryID: string;
        tableJPName: string;
        formId: string;
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
      } = {
        visible: this.referenceScreenService.isVisible(),
        columns: this.referenceScreenService.columns(),
        tableName: this.referenceScreenService.tableName(),
        queryID: this.referenceScreenService.queryID(),
        tableJPName: this.referenceScreenService.tableJPName(),
        formId: this.referenceScreenService.formId(),
        refForColumn: this.referenceScreenService.refForColumn(),
        selectedValue: this.referenceScreenService.selectedValue() ?? '',
        defaultValue: this.referenceScreenService.defaultValue() ?? {},
        rowId: this.referenceScreenService.rowId(),
        gridRefData: this.referenceScreenService.gridRefData(),
      };

      if (prev.visible !== current.visible) {
        this.visible.set(current.visible);
        if (current.visible === true) {
          this.showDialog();
        }
      }
      if (prev.columns !== current.columns) {
        this.columns = current.columns;
      }
      if (prev.tableName !== current.tableName) {
        this.tableName = current.tableName;
      }
      if (prev.queryID !== current.queryID) {
        this.queryID = current.queryID;
      }
      if (prev.tableJPName !== current.tableJPName) {
        this.tableJPName = current.tableJPName;
      }
      if (prev.formId !== current.formId) {
        this.formId = current.formId;
      }
      if (prev.refForColumn !== current.refForColumn) {
        this.refForColumn = current.refForColumn;
      }
      if (prev.selectedValue !== current.selectedValue) {
        this.selectedValue = current.selectedValue;
      }
      if (prev.defaultValue !== current.defaultValue) {
        this.defaultValue = current.defaultValue;
      }
      if (prev.rowId !== current.rowId) {
        this.rowId = current.rowId;
      }
      /**
       * If gridRefData is changed then set the necessary data for reference search.
       * Once the data is fetched then call the handleRowDoubleClick which sends the selected data.
       */
      if (current.gridRefData && prev.gridRefData !== current.gridRefData) {
        this.gridRefData = current.gridRefData;
        if (this.gridRefData?.refForColumn != '') {
          this.columns = [...(this.gridRefData?.columns ?? [])];
          this.tableName = this.gridRefData?.tableName ?? '';
          this.queryID = this.gridRefData?.queryID ?? '';
          this.refForColumn = this.gridRefData?.refForColumn ?? '';
          this.selectedValue = this.gridRefData?.selectedValue ?? '';
          this.defaultValue = this.gridRefData?.defaultValue ?? {};
          this.rowId = this.gridRefData?.rowId ?? -1;

          // Initialize with '2' for exact match search
          this.initializeSearchList('2');

          (async () => {
            await this.getData();

            if (this.gridData().length > 0) {
              this.handleRowDoubleClick(this.gridData()[0]);
            } else {
              const nullRowData: { [key: string]: any } = {};
              this.columns.forEach((col) => {
                nullRowData[col.name] = null;
              });
              this.handleRowDoubleClick(nullRowData);
            }
          })();
        }
      }

      // update prev
      prev = current;

      this.initializeSearchList();
    });
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollHeight();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngAfterViewInit(): void {
    // Bind input events for pagination rows per page select
    /**
     * The setTimeout in this case is used to delay execution until after the current JavaScript call stack is cleared
     * and this.dropdownRef?.el?.nativeElement.querySelector('input') doesnot return null
     */
    setTimeout((): void => {
      const inputEl: HTMLInputElement =
        this.dropdownRef?.el?.nativeElement.querySelector('input');

      if (inputEl) {
        inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
          const allowedKeys: string[] = [
            'Backspace',
            'ArrowLeft',
            'ArrowRight',
            'Tab',
            'Enter',
            'Delete',
          ];

          // Allow control keys
          if (allowedKeys.includes(event.key)) {
            return;
          }

          // Block non-numeric characters
          if (!/^\d$/.test(event.key)) {
            event.preventDefault();
            return;
          }

          // Predict next value
          const currentValue: string = inputEl.value;
          const selectionStart: number = inputEl.selectionStart ?? 0;
          const selectionEnd: number = inputEl.selectionEnd ?? 0;

          const nextValue: string =
            currentValue.slice(0, selectionStart) +
            event.key +
            currentValue.slice(selectionEnd);

          const numeric: number = parseInt(nextValue, 10);

          // Prevent typing if next value > 9999 or starts with 0
          if (isNaN(numeric) || numeric > 9999 || /^0\d*/.test(nextValue)) {
            event.preventDefault();
          }

          if (event.key === 'Tab') {
            event.preventDefault(); // Prevent PrimeNG from auto-closing/selecting
            inputEl.blur();
          }
        });

        inputEl.addEventListener('blur', () => {
          const value = inputEl.value;
          const numeric = parseInt(value, 10);
          const finalValue =
            !value || isNaN(numeric) || numeric <= 0
              ? this.pageSize[0]
              : numeric;

          inputEl.value = finalValue.toString();
          this.rows.set(finalValue);
          this.pageSizeDrpDown.set(finalValue);
        });
      }
    });
  }

  private initializeComponent(): void {
    // initialize with current value in the service which will be set from the button click
    this.columns = this.referenceScreenService.columns();
    this.tableName = this.referenceScreenService.tableName();
    this.queryID = this.referenceScreenService.queryID();
    this.tableJPName = this.referenceScreenService.tableJPName();
    this.formId = this.referenceScreenService.formId();
    this.refForColumn = this.referenceScreenService.refForColumn();
    this.selectedValue = this.referenceScreenService.selectedValue() ?? '';
    this.rowId = this.referenceScreenService.rowId();
    this.initializeSearchList();
  }

  private initializeSearchList(searchType?: string): void {
    const baseColumnName: string = this.refForColumn.replace(/_from|_to$/, '');

    const updatedSearchList: FILTER[] = this.columns.map(
      (column): FILTER => ({
        name: column.name,
        displayName: column.displayName,
        colMetadataKey: {
          tableName: this.tableName,
          columnName: column.name,
        },
        visible: column.searchVisible,
        required: false, // Default to false unless specified
        value_from:
          column?.defaultValueColumn &&
          column.defaultValueColumn in this.defaultValue
            ? this.defaultValue[column.defaultValueColumn]
            : column?.mainScreenColumn === baseColumnName
            ? this.selectedValue ??
              (column.dataType === '4' && column.memberList
                ? column.memberList.map((m) => m.code)
                : [])
            : '',

        value_to: '',
        match_type:
          column?.defaultValueColumn &&
          column.defaultValueColumn in this.defaultValue &&
          this.defaultValue[column.defaultValueColumn]
            ? '2'
            : searchType ?? (column.dataType === '1' ? '4' : '1'),
        data_type: column.dataType,
        memberList: column.memberList,
        invalidInput: false,
        isReferenceScreen: false,
      })
    );
    this.searchList.set(updatedSearchList);
  }

  loadGridData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestData: refScreenRequest = {
        TableName: this.tableName,
        QueryID: this.queryID,
        Columns: this.columns,
        FilterValues: this.searchList(),
        Offset: 0,
        Rows: this.rows(),
      };
      this.gridData.set([]);
      this.isLoading.update((n) => n + 1);
      this.referenceScreenService
        .getReferenceScreenData(requestData)
        .subscribe({
          next: (res) => {
            let dataCount: number = 0;
            if (res.Code === 200) {
              this.isShowFilter.set(false);
              this.gridData.set(res.Data.ReferenceData);
              dataCount = this.gridData().length;
            } else if (res.Code === 201) {
              if (this.visible()) {
                this.messageService.add({
                  severity: 'info',
                  summary: INFOMSG.I0001,
                });
              } else {
                this.messageService.add({
                  severity: 'warn',
                  summary: WARNMSG.W0001,
                  sticky: true,
                });
              }
            } else if (res.Code === 202) {
              this.messageService.add({
                severity: 'error',
                summary: res.Message,
                sticky: true,
              });
            } else if (res.Code === 203) {
              this.messageService.add({
                severity: 'error',
                summary: res.Message,
                sticky: true,
              });
            }
            this.isLoading.update((n) => Math.max(n - 1, 0));
            // no need to search for more data if first round gives less than page rows
            // this check is needed for reference selection without dialog opening and also it is efficient
            if (dataCount >= this.rows()) {
              //send request for remaining data
              this.fetchRemainingData()
                .then(() => {
                  resolve();
                })
                .catch((err) => {
                  // always pass err object in reject as it does console.error
                  // which makes a toast from toast-error.service and http errors are skipped
                  reject(err);
                });
            } else {
              resolve();
            }
          },
          error: (error) => {
            this.isLoading.update((n) => Math.max(n - 1, 0));
            // always pass err object in reject as it does console.error
            // which makes a toast from toast-error.service and http errors are skipped
            reject(error);
          },
        });
    });
  }

  fetchRemainingData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const requestData: refScreenRequest = {
        TableName: this.tableName,
        QueryID: this.queryID,
        Columns: this.columns,
        FilterValues: this.searchList(),
        Offset: this.rows(),
        Rows: null,
      };
      this.isBackgroundLoading.set(true);
      this.referenceScreenService
        .getReferenceScreenData(requestData)
        .subscribe({
          next: (res) => {
            this.isBackgroundLoading.set(false);

            if (res.Code === 200) {
              const completeData = this.gridData().concat(
                res.Data.ReferenceData
              );
              this.gridData.set(completeData);
            } else if (res.Code === 201) {
            }
            resolve();
          },
          error: (error) => {
            this.isBackgroundLoading.set(false);
            // always pass err object in reject as it does console.error
            // which makes a toast from toast-error.service and http errors are skipped
            reject(error);
          },
        });
    });
  }

  toggleFilter(): void {
    this.isShowFilter.update((show) => !show);
    setTimeout(() => this.updateScrollHeight(), 0);
  }

  async getData(): Promise<void> {
    if (this.dataTable) {
      //removing sorting and filter
      this.dataTable.clear();
    }
    await this.loadGridData();
    setTimeout(() => this.updateScrollHeight(), 0);
  }

  resetFilter(): void {
    const resetFilters = this.searchList().map(
      (filter): FILTER => ({
        ...filter,
        value_from:
          filter.data_type === '4' && filter.memberList
            ? filter.memberList.map((m) => m.code)
            : '',
        value_to: '',
        match_type: filter.data_type === '1' ? '4' : '1',
        invalidInput: false,
      })
    );

    this.searchList.set(resetFilters);
  }

  async showDialog(): Promise<void> {
    setTimeout(() => {
      this.updateScrollHeight();
    }, 0);

    this.initializeComponent();
    const initialSearchKBN = await this.refInitialSearchKBN.getData();
    if (initialSearchKBN == '1') {
      await this.loadGridData();
      setTimeout(() => this.updateScrollHeight(), 0);
    } else {
      //remove selected value, as data is not being search on opening popup
      this.referenceScreenService.selectedValue.set('');
    }
  }

  /**
   * sets the rowData as selected one and passes down
   * @param rowData
   */
  handleRowDoubleClick(rowData: any): void {
    const mainScreenColumnValues: { key: string; value: string }[] =
      this.setMainScreenColumnValues(rowData);

    const baseColumnName: string = this.refForColumn.replace(/_from|_to$/, '');
    const selectedValue: string = rowData[baseColumnName]?.toString() || '';

    // Validate default values if required
    for (const column of this.columns) {
      if (column.defaultValueColumn) {
        let expected = this.defaultValue[column.defaultValueColumn];
        let actual = rowData[column.name];

        if (column.dataType === '2') {
          expected = String(expected);
          actual = String(actual);
        } else if (column.dataType === '3') {
          expected = this.ActyCommonService.getUtcIsoDate(expected);
          actual = this.ActyCommonService.getUtcIsoDate(actual);
        }

        if (expected !== undefined && expected !== actual) {
          this.messageService.add({
            severity: 'info',
            summary: INFOMSG.I0001,
          });
          this.closeDialog();
          return;
        }
      }
    }

    this.referenceScreenService.referenceSelected.set({
      refForColumn: this.refForColumn,
      selectedValue: selectedValue,
      mainScreenColumnValues: mainScreenColumnValues,
      rowId: this.rowId,
    });
    this.closeDialog();
  }

  /**
   * this.columns() will have mainScreenColumn prop which will have mainscreen column name
   * so below function will make key value pair form those columns
   * @param rowData
   * @returns dictionary for mainscreen columns
   */
  setMainScreenColumnValues(rowData: any): { key: string; value: string }[] {
    return this.columns
      .filter((column: refScreenColumns) => column.mainScreenColumn)
      .map((column: refScreenColumns) => ({
        key: column.mainScreenColumn!,
        value: rowData[column.name]?.toString() || '',
      }));
  }

  /**
   * fills up the remaining height of the screen with the grid by setting its height with that much px
   * @returns
   */
  updateScrollHeight(): void {
    const dataDiv: HTMLElement = document.querySelector(
      '.refDataDiv'
    ) as HTMLElement;
    if (!dataDiv) return;

    const paginator: HTMLElement = dataDiv.querySelector(
      '.p-paginator'
    ) as HTMLElement;

    const paginationHeight: number = paginator.clientHeight;

    const availableHeight: number = dataDiv.clientHeight - paginationHeight - 18; // 18 is padding

    const tableContainer: HTMLElement = dataDiv.querySelector(
      '.p-datatable-table-container'
    ) as HTMLElement;
    if (tableContainer) {
      tableContainer.style.height = `${availableHeight}px`;
      tableContainer.style.maxHeight = `${availableHeight}px`;
    }
    window.dispatchEvent(new Event('resize'));
  }

  OnInputEvent(name: string): void {
    this.searchList.update((filters: FILTER[]) =>
      filters.map((filter: FILTER) =>
        filter.name === name ? { ...filter, invalidInput: false } : filter
      )
    );
  }

  /**
   * On column resize manually update the left of all th and td.
   * Need to do it because of frozen and sticky column combination bug of primeng
   * @param event
   */
  colResizeEvent(event: any): void {
    const resizedTh: HTMLElement = event.element as HTMLElement;
    const thRow: HTMLElement = resizedTh.parentElement as HTMLElement;
    const allThs: NodeListOf<HTMLElement> = thRow.querySelectorAll('th');

    let cumulativeLeft: number = 0;

    allThs.forEach((th: HTMLElement, index: number) => {
      if (th.classList.contains('p-datatable-frozen-column')) {
        th.style.left = `${cumulativeLeft}px`;
        cumulativeLeft += th.offsetWidth;
      }
    });

    // Update corresponding sticky <td>s in each row
    const table: HTMLElement = resizedTh.closest('table') as HTMLElement;
    const allRows: NodeListOf<HTMLElement> = table.querySelectorAll('tbody tr');

    allRows.forEach((row: HTMLElement) => {
      const tds: NodeListOf<HTMLElement> = row.querySelectorAll('td');

      let left: number = 0;
      tds.forEach((td: HTMLElement, index: number) => {
        if (td.classList.contains('p-datatable-frozen-column')) {
          td.style.left = `${left}px`;
          left += td.offsetWidth;
        }
      });
    });
  }

  getTotalRecords(): number {
    if (this.dataTable) {
      return this.dataTable.totalRecords;
    } else return 0;
  }

  closeDialog(): void {
    this.gridData.set([]);
    this.referenceScreenService.closeRefScreen();
  }

  OnRowChange(event: any): void {
    if (event.originalEvent instanceof PointerEvent) {
      this.rows.set(event.value);
    }
  }

  showInitialSearchKbnDialog(): void {
    this.displayInitialSearchKbnDialog.set(true);
  }
  closeInitialSearchKbnDialog(): void {
    this.displayInitialSearchKbnDialog.set(false);
  }

  /**
   * get the kbn value by its key from memberList
   * @param key
   * @param memberList
   * @returns
   */
  getKBNNm(
    code: string,
    memberList: { code: string; name: string }[]
  ): string | undefined {
    return memberList.find((l) => l.code === code)?.name;
  }

  onDialogResize(event: any): void {
    this.updateScrollHeight();
  }
}
