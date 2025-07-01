import {
  Component,
  computed,
  ElementRef,
  HostListener,
  inject,
  input,
  NgZone,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SplitterModule } from 'primeng/splitter';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { TableModule, Table } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { MultiSelectModule } from 'primeng/multiselect';
import {
  ConfirmationService,
  MenuItem,
  MessageService,
  SortEvent,
} from 'primeng/api';
import { DatePickerModule } from 'primeng/datepicker';
import { MessageModule } from 'primeng/message';
import { SplitButton } from 'primeng/splitbutton';
import { COMMON, GRID_TEXT, TOROKU } from '../../../shared/jp-text';
import { SwapColumnService } from '../../../services/core/swap-column.service';
import { CONFIG } from '../../../shared/config';
import { TableOptionsComponent } from '../table-options/table-options.component';
import { FILTER } from '../../../model/core/filter.type';
import { SaveData } from '../../../model/core/saveData.type';
import {
  SUCCESSMSG,
  CONFIRMMSG,
  WARNMSG,
  ERRMSG,
  INFOMSG,
} from '../../../shared/messages';
import { SwapColumn } from '../../../model/core/swapColumn.type';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CellSummaryComponent } from '../cell-summary/cell-summary.component';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { FormStateService } from '../../../services/base/form-state.service';
import { Router, UrlTree } from '@angular/router';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { SaveDataService } from '../../../services/core/save-data.service';
import { ActyCommonService } from '../../../services/shared/acty-common.service';
import { DataChangeDetectedService } from '../../../services/core/data-change-detected.service';
import { ReferenceScreenButtonComponent } from '../reference-screen-button/reference-screen-button.component';
import { ActyDialogService } from '../../../services/shared/acty-dialog.service';
import { GRID, GRID_BTN } from '../../../model/core/grid.type';
import { GetDataService } from '../../../services/core/get-data.service';
import { firstValueFrom, take } from 'rxjs';
import { LayoutService } from '../../../layout/service/layout.service';

@Component({
  selector: 'app-grid',
  imports: [
    SplitterModule,
    InputTextModule,
    SelectModule,
    InputGroup,
    FormsModule,
    InputGroupAddonModule,
    ButtonModule,
    TableModule,
    CommonModule,
    DialogModule,
    MultiSelectModule,
    DatePickerModule,
    SplitButton,
    MessageModule,
    TableOptionsComponent,
    ProgressSpinnerModule,
    MaxLengthDirective,
    ReferenceScreenButtonComponent,
    CellSummaryComponent,
  ],
  templateUrl: './grid.component.html',
  styleUrl: './grid.component.scss',
  providers: [ConfirmationService],
})
export class GridComponent implements OnChanges, OnInit {
  @ViewChild('filter') filter!: ElementRef;
  @ViewChild('dt') dataTable!: Table;

  messageService = inject(MessageService);
  formStateService = inject(FormStateService);
  router = inject(Router);
  //for swap data
  swapColumnService = inject(SwapColumnService);
  service = inject(GetDataService);
  SaveDataService = inject(SaveDataService);
  ActyCommonService = inject(ActyCommonService);
  DataChangeDetected = inject(DataChangeDetectedService);
  actyDialogService = inject(ActyDialogService);
  ngZone = inject(NgZone);
  layoutService = inject(LayoutService);

  userId = input.required<string>();
  formId = input.required<string>();
  formTitle = input.required<string>();
  dataGridInp = input.required<any[]>();
  editableGrid = input.required<boolean>();
  getDataUrl = input.required<string>();
  pageSizes = input<number[]>(CONFIG.DEFAULT.PAGESIZES);
  showExport = input<boolean>(true);
  searchList = input<Array<FILTER>>([]);
  exportURL = input<string>('');
  showSortData = input<boolean>(true);
  showSwapCol = input<boolean>(true);
  saveURL = input<string>('');
  isCellSummary = input<boolean>(false);
  refScreenDefaultValue = input<{ [key: string]: any }>({});
  //url for toroku form, required if you want to use redirect to toroku buttons
  torokuFormURL = input<string>();
  extraBtnsList = input<GRID_BTN[]>();
  showSanshoModeBtn = input<boolean>(true);
  showHenshuModeBtn = input<boolean>(true);
  showAddModeBtn = input<boolean>(true);
  showCopyModeBtn = input<boolean>(true);
  //This will be used to enable/disable the add, edit and copy buttons
  addRow = input<boolean>(true);
  editRow = input<boolean>(true);
  copyRow = input<boolean>(true);
  deleteRow = input<boolean>(true);
  resizableCols = input<boolean>(true);
  sortableCols = input<boolean>(true);
  filterableCols = input<boolean>(true);
  bottomBorderInterval = input<{ [columnName: string]: number }>();
  rowColoring = input<{
    groupSize: number;
    rules: {
      positionInGroup: number;
      color: string;
      darkModeColor?: string;
      exemptColumns?: string[];
    }[];
  }>({ groupSize: 0, rules: [] });
  columnColoring = input<
    {
      columnName: string;
      color: string;
      darkModeColor?: string;
      headerOnly?: boolean; // true = only header, false = whole column
    }[]
  >([]);

  // Outputs
  isLoading = output<boolean>();
  isBackgroundLoading = output<boolean>();

  textContent: any = GRID_TEXT;
  torokuText: any = TOROKU;
  textContentCommon: any = COMMON;
  //sansho screen option to open in new tab or new window
  torokuOpenWith_0: MenuItem[] = [
    {
      label: this.torokuText.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(0, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.torokuText.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(0, 'window'), // new window
    },
  ];
  //New mode screen option to open in new tab or new window
  torokuOpenWith_1: MenuItem[] = [
    {
      label: this.torokuText.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(1, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.torokuText.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(1, 'window'), // new window
    },
  ];
  //Edit mode screen option to open in new tab or new window
  torokuOpenWith_2: MenuItem[] = [
    {
      label: this.torokuText.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(2, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.torokuText.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(2, 'window'), // new window
    },
  ];
  //copy mode screen option to open in new tab or new window
  torokuOpenWith_3: MenuItem[] = [
    {
      label: this.torokuText.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(5, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.torokuText.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(5, 'window'), // new window
    },
  ];
  primaryKeyColumns: string[] = [];
  dialogVisible: boolean = false;
  oldData: any = {};
  currData: any = {};
  selectedData: any;
  // swapData - determined the order, visibility and frozen properties of grid
  swapData: SwapColumn[] = [];
  options: any[] = [];
  computedValues: Record<string, string> = {};
  lastSelectedCell: { rowIndex: number; columnName: string } | null = null;
  isCtrlPressed: boolean = false;
  isShiftPressed: boolean = false;
  isMouseDownOnCell: boolean = false;
  isDragged: boolean = false;
  errMsgs: any = ERRMSG;
  validationErrors: { [key: string]: { errMsg: string } } = {};
  saveList: SaveData = {
    Formid: '',
    Userid: '',
    Programnm: '',
    AddList: [],
    UpdateList: [],
    DeleteList: [],
  };
  currentMode: number = 1; // 1 for Add, 2 for Edit, 3 for Copy
  isTouchDevice: boolean = this.ActyCommonService.isTouchDevice();

  dataList = signal<any[]>([]);
  dataGrid = signal<any[]>([]);
  rowsPerPage = signal<number>(this.pageSizes()[0]);
  selectedCells = signal<Set<string>>(new Set());
  isCellModeEnabled = signal<boolean>(false);
  dataSaveMode = signal<string>('');
  isBackgroundOn = signal<boolean>(false);
  refScreenOnRowData = signal({
    tableName: '',
    queryID: '',
    columns: [],
    rowId: -1,
    refForColumn: '',
    selectedValue: '',
    defaultValue: {},
  });

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollHeight();
  }

  // Host Listeners for key & mouse events
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if (event.ctrlKey) this.isCtrlPressed = true;
    if (event.shiftKey) this.isShiftPressed = true;
  }

  @HostListener('document:keyup', ['$event'])
  onKeyup(event: KeyboardEvent): void {
    if (!event.ctrlKey) this.isCtrlPressed = false;
    if (!event.shiftKey) this.isShiftPressed = false;
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    // If clicked outside the table, reset selection behavior
    if (!(event.target as HTMLElement).closest('table.p-datatable')) {
      this.isMouseDownOnCell = false;
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent): void {
    this.isMouseDownOnCell = false;
  }

  @HostListener('click', ['$event'])
  onGridClick(event: MouseEvent): void {
    const target: HTMLElement = event.target as HTMLElement;

    // If clicking outside of a data cell, clear selection
    if (
      !this.isDragged &&
      !target.closest('.p-datatable-tbody td') &&
      !target.closest('.cellSummary') &&
      !target.closest('.summaryHeader') &&
      !target.closest('.cellSummaryOutput .p-dialog')
    ) {
      this.clearSelection();
    } else {
      this.isDragged = false;
      //call copy functionality when Ctrl + C is pressed
      this.copySelectedCellsToClipboard();
    }
  }

  ngOnInit(): void {
    this.getSwapColumnData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataGridInp']) {
      this.primaryKeyColumns = this.dataGridInp()
        .filter((column: any) => column.primaryKey === true)
        .map((column: any) => column.name);

      this.updateGridSwapData();
    }

    if (changes['formId'] && changes['userId'] && changes['formTitle']) {
      this.saveList.Formid = this.formId();
      this.saveList.Userid = this.userId();
      this.saveList.Programnm = this.formTitle();
    }
  }

  updateScrollHeight(): void {
    setTimeout(() => {
      const dataDivHeight =
        document.querySelector('.dataDiv')?.clientHeight || 0;
      const paginationHeight = 51;
      const headerHeight = 55;
      const padding = 20;

      // Calculate available height dynamically
      const availableHeight =
        dataDivHeight - paginationHeight - headerHeight - padding;
      const scrollHeight: string = `${availableHeight}px`;

      const dataDiv = document.querySelector(
        '.dataDiv .p-datatable-table-container:not(.swapDataDiv .p-datatable-table-container):not(.refDataDiv .p-datatable-table-container)'
      ) as HTMLElement;

      if (dataDiv) {
        //if the available height is greater than 8px then hide the filter div
        if (availableHeight > 8) {
          dataDiv.style.display = '';
          dataDiv.style.height = scrollHeight;
          dataDiv.style.maxHeight = scrollHeight;
        } else {
          dataDiv.style.display = 'none';
        }
      }
    }, 50); // Small delay to ensure rendering is complete
  }

  clear(table: Table): void {
    table.clear();
  }

  modifyDataList(): void {
    let rowid = 1;
    //assigning a unique rowid to every row and also changing data format of date columns
    const updatedList = this.dataList().map((item: any) => {
      const newitem = { ...item, rowid: rowid };
      rowid++;

      //converting date columns into date object
      this.dataGrid().forEach((column: GRID) => {
        if (column.dataType === '3') {
          newitem[column.name] = newitem[column.name]
            ? new Date(newitem[column.name])
            : '';
        }
      });
      return newitem;
    });

    this.dataList.set(structuredClone(updatedList));
    this.selectedCells().clear();
    this.selectedData = this.editableGrid() ? [] : null;
  }

  getData(): Promise<void> {
    this.isLoading.emit(true);
    this.dataList.set([]);

    return new Promise((resolve, reject) => {
      this.service
        .getDataOfPage(
          this.searchList(),
          this.userId(),
          this.formId(),
          this.getDataUrl(),
          0,
          this.rowsPerPage()
        )
        .subscribe({
          next: (res) => {
            if (res.Code === 200) {
              this.dataList.set(res.Data.Records);
              this.modifyDataList();
              this.updateScrollHeight();
            } else if (res.Code === 201) {
              this.messageService.add({
                severity: 'info',
                summary: INFOMSG.I0001,
              });
            }

            this.isLoading.emit(false);

            //send request for remaining data
            this.fetchRemainingData(this.getDataUrl())
              .then(() => {
                resolve();
              })
              .catch((err) => {
                // always pass err object in reject as it does console.error
                // which makes a toast from toast-error.service and http errors are skipped
                reject(err);
              });
            this.alignFrozenColumnsLeft();
          },
          error: (err) => {
            //set loading to false to hide the loader at the time of end of data fetch
            this.isLoading.emit(false);
            // always pass err object in reject as it does console.error
            // which makes a toast from toast-error.service and http errors are skipped
            reject(err);
          },
        });
    });
  }

  fetchRemainingData(formGetUrl: string): Promise<void> {
    this.isBackgroundOn.set(true);
    this.isBackgroundLoading.emit(true);
    return new Promise((resolve, reject) => {
      this.service
        .getDataOfPage(
          this.searchList(),
          this.userId(),
          this.formId(),
          formGetUrl,
          this.rowsPerPage(),
          null
        )
        .subscribe({
          next: (res) => {
            if (res.Code === 200) {
              const completeData = this.dataList().concat(res.Data.Records);
              this.dataList.set(completeData);
              this.modifyDataList();
            } else if (res.Code === 201) {
            }
            resolve();
            this.isBackgroundOn.set(false);
            this.isBackgroundLoading.emit(false);
          },
          error: (err) => {
            // always pass err object in reject as it does console.error
            // which makes a toast from toast-error.service and http errors are skipped
            reject(err);
            this.isBackgroundOn.set(false);
            this.isBackgroundLoading.emit(false);
          },
        });
    });
  }

  openNew(): void {
    this.currData = {};
    this.currentMode = 1; // Set mode to New
    const updatedRowData = this.dataGrid()
      .filter((column: any) => column.visible === true)
      .reduce((acc: any, column: any) => {
        // If the column has a memberList (indicating it's a dropdown), set the first option's code
        if (column.memberList && column.memberList.length > 0) {
          acc[column.name] = column.memberList[0].code; // Set default to first option's code
        } else {
          acc[column.name] = null; // Initialize with null for non-dropdown fields
        }
        return acc;
      }, {});

    this.dataSaveMode.set(this.textContent.ADD_DATA);
    this.currData = structuredClone(updatedRowData);
    this.dialogVisible = true;
  }

  openEdit(rowData: any): void {
    this.currentMode = 2; // Set mode to Edit
    this.dataSaveMode.set(this.textContent.EDIT_DATA);
    this.oldData = structuredClone(rowData);
    this.currData = structuredClone(rowData);
    this.dialogVisible = true;
  }

  openCopy(rowData: any): void {
    this.currentMode = 3; // Set mode to Copy
    let updatedRowData = structuredClone(rowData);

    // Set all column values in rowData to null, except for primary key columns
    for (const key in updatedRowData) {
      if (!this.primaryKeyColumns || this.primaryKeyColumns.includes(key)) {
        updatedRowData[key] = null;
      }
    }

    this.dataSaveMode.set(this.textContent.COPY_ROW);
    this.oldData = structuredClone(updatedRowData);
    this.currData = structuredClone(updatedRowData);
    this.dialogVisible = true;
  }

  hideDialog(): void {
    this.validationErrors = {};
    this.dialogVisible = false;
    this.DataChangeDetected.dataChangeListReset();
  }

  async deleteData(rowData: any): Promise<void> {
    const pkColumnData = this.getRowPkData(rowData);
    const pkData = Object.values(pkColumnData)[0];
    // reset save list
    this.saveList.AddList = [];
    this.saveList.UpdateList = [];
    this.saveList.DeleteList = [];
    const result = await this.actyDialogService.show({
      message: pkData + ' ' + CONFIRMMSG.C0002,
      buttons: [
        {
          label: TOROKU.NO,
        },
        {
          label: TOROKU.YES,
          severity: 'primary',
        },
      ],
    });
    if (result === 1) {
      const dateColumnList = this.dataGridInp()
        .filter((field: any) => field.dataType === '3')
        .map((field) => field.name);
      const numberColumnList = this.dataGridInp()
        .filter((field: any) => field.dataType === '2')
        .map((field) => field.name);

      //date column conversion to UTC ISO format
      dateColumnList.forEach((columnName: string) => {
        if (rowData.hasOwnProperty(columnName)) {
          rowData[columnName] = this.ActyCommonService.getUtcIsoDate(
            rowData[columnName]
          );
        }
      });

      // number column conversion to null if empty
      numberColumnList.forEach((columnName: string) => {
        if (rowData.hasOwnProperty(columnName)) {
          rowData[columnName] =
            rowData[columnName] !== '' ? rowData[columnName] : null;
        }
      });

      // YES pressed
      this.saveList.DeleteList.push(rowData);
      this.selectedData = [];
      this.isLoading.emit(true);
      this.SaveDataService.saveData(this.saveList, this.saveURL()).subscribe({
        next: (res) => {
          this.hideDialog();
          this.isLoading.emit(false);
          if (res.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            this.hideDialog();
            this.getData();
          } else {
            this.hideDialog();
          }
        },
        error: (err) => {
          this.isLoading.emit(false);
        },
      });
    } else if (result === 0) {
      // NO pressed
    }
  }

  async deleteSelectedData(): Promise<void> {
    // reset save list
    this.saveList.AddList = [];
    this.saveList.UpdateList = [];
    this.saveList.DeleteList = [];
    const result = await this.actyDialogService.show({
      message: CONFIRMMSG.C0004,
      buttons: [
        {
          label: TOROKU.NO,
        },
        {
          label: TOROKU.YES,
          severity: 'primary',
        },
      ],
    });
    if (result === 1) {
      // YES pressed
      this.dataList.set(
        this.dataList().filter((r: any) => !this.selectedData?.includes(r))
      );

      const dateColumnList = this.dataGridInp()
        .filter((field: any) => field.dataType === '3')
        .map((field) => field.name);
      const numberColumnList = this.dataGridInp()
        .filter((field: any) => field.dataType === '2')
        .map((field) => field.name);

      //date column conversion to UTC ISO format
      dateColumnList.forEach((columnName: string) => {
        this.selectedData.forEach((row: any) => {
          if (row.hasOwnProperty(columnName)) {
            row[columnName] = this.ActyCommonService.getUtcIsoDate(
              row[columnName]
            );
          }
        });
      });

      // number column conversion to null if empty
      numberColumnList.forEach((columnName: string) => {
        this.selectedData.forEach((row: any) => {
          if (row.hasOwnProperty(columnName)) {
            row[columnName] = row[columnName] !== '' ? row[columnName] : null;
          }
        });
      });

      this.saveList.DeleteList.push(...this.selectedData);
      this.selectedData = [];
      this.isLoading.emit(true);
      this.SaveDataService.saveData(this.saveList, this.saveURL()).subscribe({
        next: (res) => {
          this.hideDialog();
          this.isLoading.emit(false);
          if (res.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            this.hideDialog();
            this.getData();
          } else {
            this.hideDialog();
          }
        },
        error: (err) => {
          this.isLoading.emit(false);
        },
      });
    } else if (result === 0) {
      // NO pressed
    }
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

  /**
   * On column resize manually update the left of all th and td.
   * Need to do it because of frozen and sticky column combination bug of primeng
   * @param event
   */
  colResizeEvent(event: any): void {
    const resizedTh: HTMLElement = event.element as HTMLElement;
    // Update corresponding sticky <th>s in each row
    const table: HTMLElement = resizedTh.closest('table') as HTMLElement;
    const allThRows: NodeListOf<HTMLElement> =
      table.querySelectorAll('thead tr');

    allThRows.forEach((row: any) => {
      const tds: NodeListOf<HTMLElement> = row.querySelectorAll('th');

      let left: number = 0;
      tds.forEach((td: HTMLElement, index: number) => {
        if (td.classList.contains('p-datatable-frozen-column')) {
          td.style.left = `${left}px`;
          left += td.offsetWidth;
        }
      });
    });

    // Update corresponding sticky <td>s in each row
    const allRows: NodeListOf<HTMLElement> = table.querySelectorAll('tbody tr');

    allRows.forEach((row: any) => {
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

  // Grid sorting logic (matches Oracle sorting behavior)
  customSort(event: SortEvent): void {
    if (event.data) {
      event.data.sort((data1, data2): number => {
        let value1: number = data1[event.field ?? 0];
        let value2: number = data2[event.field ?? 0];

        if (value1 == null) return -1;
        if (value2 == null) return 1;

        return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      });

      if (event.order === -1) {
        event.data.reverse();
      }
    }
  }

  // returns the name and display name for visible columns in the grid
  gridColumnNameAndDisplayNameList(): any {
    return this.dataGridInp()
      .filter((item: any) => item.visible)
      .map(({ name, displayName, dateFormat }: any) => ({
        name,
        displayName,
        dateFormat: dateFormat ?? 'yyyy/MM/dd',
      }));
  }

  // returns the name and display name for all columns(visible or not) for the grid
  gridColumnNameAndDisplayNameListAll(): any {
    return this.dataGridInp()
      .filter(({ gridIgnore }: any) => gridIgnore !== true)
      .map(({ name, displayName }: any) => ({
        name,
        displayName,
      }));
  }

  onSwapDataUpdate(newSwapData: Array<SwapColumn>): void {
    this.swapData = newSwapData;
    this.updateGridSwapData();
  }

  onSortDataChange(): void {
    // set little timeout for loader as sort data component will emit a false value for loading
    setTimeout(() => {
      this.getData();
    }, 50);
  }

  isLoadingStateChange(isLoadingState: boolean): void {
    this.isLoading.emit(isLoadingState);
  }

  getTotalRecords(): number {
    if (this.dataTable) {
      return this.dataTable.totalRecords;
    } else return 0;
  }

  /**
   * using current component's this.primaryKeyColumns(), it will make an key value pair for columns in this.primaryKeyColumns()
   * the values will be set from rowData
   * @param rowData
   * @returns
   */
  getRowPkData(rowData: any): { [key: string]: any } {
    const pkCols: string[] = this.primaryKeyColumns;
    const pkData: { [key: string]: any } = {};

    pkCols.forEach((col) => {
      pkData[col] = rowData[col];
    });

    return pkData;
  }

  /**
   * function to open the toroku form
   * @param mode
   * @param targetType
   */
  navigateWithEncodedMode(
    mode: number,
    targetType: 'same' | 'tab' | 'window' = 'same'
  ): void {
    const pkData: string | null =
      mode !== 1 ? JSON.stringify(this.getRowPkData(this.selectedData)) : null;
    const encoded: string = btoa(`mode=${mode}&pkData=${pkData}`);

    // save form state for modoru
    this.formStateService.torokuModoruFormId.set(this.formId());

    const formState: any = {
      isSearched: this.dataList() != null, // if dataList() is null that means user havent presses search button, so we will not search
      searchList: this.searchList(),
      selectedRowId: this.selectedData?.rowid,
      dtFirst: this.dataTable.first,
      dtSortField: this.dataTable.sortField,
      dtSortOrder: this.dataTable.sortOrder,
      dtFilter: this.dataTable.filters,
      dtRowsPerPage: this.dataTable.rows,
    };

    this.formStateService.setFormState(this.formId(), formState);

    const urlTree: UrlTree = this.router.createUrlTree([this.torokuFormURL()], {
      queryParams: { key: encoded },
    });
    const baseHref: string = (
      document.getElementsByTagName('base')[0]?.href || window.location.origin
    ).replace(/\/$/, ''); // remove tailing backslash
    const fullUrl: string = baseHref + this.router.serializeUrl(urlTree);

    if (targetType === 'tab') {
      window.open(fullUrl, '_blank'); // Opens in a new tab
    } else if (targetType === 'window') {
      window.open(fullUrl, '_blank', 'width=1400,height=700'); // Opens in a new window with custom size
    } else {
      this.router.navigateByUrl(urlTree); // Same tab navigation
    }
  }

  setSelectedRow(rowid: number): void {
    this.selectedData = this.dataList().find((r) => r.rowid === rowid);
    this.scrollToSelectedRow();
  }

  /**
   * sorts the grid
   * @param field
   * @param order
   */
  setGridSort(field: string, order: number): void {
    this.dataTable.sort({ field: field });
    // if we want to reverse sort then we need to execute this.dataTable.sort on same field
    // thats how primeng works!
    if (order === -1) {
      this.dataTable.sort({ field: field });
    }
  }

  /**
   * sets the datatable filters
   * @param filterData
   */
  setGridFilter(filterData: any): void {
    if (!this.dataTable) return;

    // Set the entire filter object directly
    this.dataTable.filters = filterData;

    // Now, manually trigger the filtering logic
    this.dataTable._filter(); // PrimeNG's internal filter trigger
  }

  /**
   * Applies this.swapData() to current grid
   * @returns
   */
  updateGridSwapData(): void {
    const _swapData: SwapColumn[] = this.swapData; // Get stored swap data
    if (!_swapData || _swapData.length === 0) {
      this.dataGrid.set(this.dataGridInp());
      return;
    }

    // Update this.dataGrid based on swapData
    const updatedGrid = this.dataGridInp().map((gridItem) => {
      const swapItem = _swapData.find((swap) => swap.COLNM === gridItem.name);

      return swapItem
        ? {
            ...gridItem,
            displaySeq: swapItem.DISPCOLNO,
            frozen: swapItem.FROZEN === 1, // Convert number to boolean
            visible: swapItem.VISIBLE === 1, // Convert number to boolean
          }
        : gridItem;
    });

    // Sort with frozen columns first (sorted by displaySeq), then others (sorted by displaySeq)
    updatedGrid.sort((a, b) => {
      // If one is frozen and the other isn't, frozen comes first
      if (a.frozen && !b.frozen) return -1;
      if (!a.frozen && b.frozen) return 1;

      // If both are frozen or both non-frozen, sort by displaySeq
      return (a.displaySeq ?? 0) - (b.displaySeq ?? 0);
    });

    this.dataGrid.set(updatedGrid);
  }

  /**
   * get the column swap data from db
   */
  async getSwapColumnData(): Promise<void> {
    this.swapData = await this.swapColumnService.getSwapDataOfForm(
      this.userId(),
      this.formId()
    );
    this.updateGridSwapData();
  }

  /**
   * executes when summary changes in CellSummaryComponent
   * @param summaryState
   */
  onSymmaryChanged(summaryState: {
    options: any[];
    isCellModeEnabled: boolean;
    computedValues: Record<string, string>;
  }): void {
    this.isCellModeEnabled.set(summaryState.isCellModeEnabled);
    if (this.isCellModeEnabled()) {
      this.selectedData = null;
    } else {
      this.selectedCells().clear();
    }
    this.options = summaryState.options;
    this.computedValues = summaryState.computedValues;
    if (!summaryState) {
      this.clearSelection();
    }
  }

  // Clear all selected cells and emit empty selection
  private clearSelection(): void {
    this.selectedCells.set(new Set());
    this.lastSelectedCell = null;
  }

  /**
   * Values of all cells in this.selectedCells()
   * Contains the value, dataType(for cell summary), row, column and memberList(for getting display value form the original key value)
   */
  selectedValues = computed((): any => {
    return Array.from(this.selectedCells()).map((cellKey) => {
      const [rowIndex, field] = cellKey.split('-');
      const rowData: any = this.dataList()[+rowIndex];

      const columnData: any = this.dataGrid().find(
        (col: any) => col.name === field
      );
      return {
        value: rowData ? rowData[field] : null,
        dataType: columnData ? columnData.dataType : '',
        row: rowIndex,
        column: field,
        memberList: columnData.memberList ?? null,
      };
    });
  });

  /**
   * To copy the selected cell values in tab-separated format
   * @returns
   */
  private copySelectedCellsToClipboard(): void {
    if (this.selectedCells().size === 0) return;

    // Format data as tab-separated values (for Excel-like pasting)
    const selectedValues: any = this.selectedValues();
    let clipboardData: string = '';

    // Group values by row (for multi-cell selection)
    const rows: Map<number, any[]> = new Map<number, any[]>();

    selectedValues.forEach((cell: any) => {
      const rowIndex: number = Number(cell.row); // Ensure correct row reference
      if (!rows.has(rowIndex)) {
        rows.set(rowIndex, []);
      }

      let cellValue: any = cell.value;

      // If the data type is '3', format it as yyyy/mm/dd
      if (cell.dataType === '3' && cellValue instanceof Date) {
        const year: number = cellValue.getFullYear();
        const month: string = String(cellValue.getMonth() + 1).padStart(2, '0');
        const day: string = String(cellValue.getDate()).padStart(2, '0');
        cellValue = `${year}/${month}/${day}`;
      }

      // If the data type is '4', match key from memberList
      if (cell.dataType === '4') {
        const matchedItem: { key: string; value: string } =
          cell.memberList.find(
            (item: { key: string; value: string }) =>
              item.key === String(cellValue)
          );
        if (matchedItem) {
          cellValue = matchedItem.value;
        }
      }

      rows.get(rowIndex)!.push(cellValue);
    });

    // Convert to TSV format with new line when row changes
    rows.forEach((rowValues) => {
      clipboardData += rowValues.join('\t') + '\n';
    });

    // Copy to clipboard
    navigator.clipboard.writeText(clipboardData.trim());
  }

  /**
   * Handles multiple cases when a cell is clicked. Cases like select call and if shift is presses then select all cells in between previous and current selected cell
   * and if ctrl is pressed then toggle the selection for that cell
   * @param rowData
   * @param column
   * @param rowIndex
   * @param event
   * @returns
   */
  onCellClick(
    rowData: any,
    column: any,
    rowIndex: number,
    event: MouseEvent
  ): void {
    event.stopPropagation();
    if (!this.isCellModeEnabled()) {
      this.clearSelection();
      return;
    }

    const cellKey: string = `${rowIndex}-${column.name}`;
    let currentSelectedCells: Set<string> = new Set(this.selectedCells());

    //This condition is for the press shift kry then click to select multiple cells
    if (this.isShiftPressed) {
      // Shift + Click: Select range of cells
      if (this.lastSelectedCell) {
        const startRow: number = Math.min(
          this.lastSelectedCell!.rowIndex,
          rowIndex
        );
        const endRow: number = Math.max(
          this.lastSelectedCell!.rowIndex,
          rowIndex
        );
        const startColumn: number = this.dataGrid().findIndex(
          (col: any) => col.name === this.lastSelectedCell!.columnName
        );
        const endColumn: number = this.dataGrid().findIndex(
          (col: any) => col.name === column.name
        );

        for (let r: number = startRow; r <= endRow; r++) {
          for (
            let c: number = Math.min(startColumn, endColumn);
            c <= Math.max(startColumn, endColumn);
            c++
          ) {
            const rangeCellKey: string = `${r}-${this.dataGrid()[c].name}`;
            currentSelectedCells.add(rangeCellKey);
          }
        }
      }
    } else if (this.isCtrlPressed) {
      // Ctrl + Click: Multi-select
      currentSelectedCells.has(cellKey)
        ? currentSelectedCells.delete(cellKey)
        : currentSelectedCells.add(cellKey);
    } else {
      // Normal Click: Select single cell
      currentSelectedCells.clear();
      currentSelectedCells.add(cellKey);
    }

    if (!this.isShiftPressed) {
      // Store last selected cell
      this.lastSelectedCell = { rowIndex, columnName: column.name };
    }

    // Mark that the mouse is down on a valid cell
    this.isMouseDownOnCell = true;

    this.updateSelection(currentSelectedCells, rowData, column);
  }

  /**
   * Event triggers when cursor enters the cell area.
   * Used to drag select the cells when mouse is clicked.
   * @param rowIndex
   * @param columnName
   * @returns
   */
  onCellMouseEnter(rowIndex: number, columnName: string): void {
    if (this.isMouseDownOnCell) {
      const lastCell = this.lastSelectedCell;
      if (!lastCell) return;

      const startRow: number = Math.min(lastCell.rowIndex, rowIndex);
      const endRow: number = Math.max(lastCell.rowIndex, rowIndex);
      const startColumn: number = this.dataGrid().findIndex(
        (col: any) => col.name === lastCell.columnName
      );
      const endColumn: number = this.dataGrid().findIndex(
        (col: any) => col.name === columnName
      );

      let newSelectedCells: Set<string> = new Set<string>();

      // Select only the cells within the drag range
      for (let r: number = startRow; r <= endRow; r++) {
        for (
          let c: number = Math.min(startColumn, endColumn);
          c <= Math.max(startColumn, endColumn);
          c++
        ) {
          newSelectedCells.add(`${r}-${this.dataGrid()[c].name}`);
        }
      }

      // Update selected cells and emit changes
      this.selectedCells.set(newSelectedCells);
      this.isDragged = true;
    }
  }

  /**
   * returns true if cell is in this.selectedCells()
   * @param rowIndex
   * @param columnName
   * @returns
   */
  isSelected(rowIndex: number, columnName: string): boolean {
    return this.selectedCells().has(`${rowIndex}-${columnName}`);
  }
  // Update selection and emit related events
  private updateSelection(
    newSelection: Set<string>,
    rowData: any,
    column: any
  ): void {
    this.selectedCells.set(newSelection);
  }

  // when data is selected from reference screen this function will be ececuted to set that data
  async onReferenceDataSelected(event: {
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
  }): Promise<void> {
    // Reset validation errors for the column being updated
    this.onInput(event.refForColumn);
    const updatedData = { ...this.currData };

    for (const { key, value } of event.mainScreenColumnValues) {
      if (key in updatedData) {
        (updatedData as Record<string, any | null>)[key] = value;
      }
    }
    this.currData = updatedData;
    this.changeDetectValidate(
      event.refForColumn,
      this.currData[event.refForColumn]
    );

    const column = this.dataGrid().find(
      (col: any) => col.name === event.refForColumn
    );
    // execute the callback function
    if (column.onChangeCallback) {
      column.onChangeCallback(this.currData);
    }

    // Clear ref screen data
    this.refScreenOnRowData.set({
      tableName: '',
      queryID: '',
      columns: [],
      rowId: -1,
      refForColumn: '',
      selectedValue: '',
      defaultValue: {},
    });
  }

  /**
   * When done input then this is executed
   * @param rowData
   * @param column
   * @param hasReferenceScreen
   */
  onInputFinished(rowData: any, column: any): void {
    const hasReferenceScreen = !column.primaryKey && column.isReferenceScreen;
    // if it has reference screen then get its ref data by setting this.refScreenOnRowData
    if (hasReferenceScreen) {
      this.setRefScreenRowData(rowData, column.name);
    }
    if (column.onChangeCallback) {
      column.onChangeCallback(rowData);
    }
  }

  /**
   * function will set refScreenOnRowData which is used for getting reference data without opening the reference screen
   * @param rowData
   * @param column
   */
  setRefScreenRowData(rowData: any, column: string): void {
    const gridColumn = this.dataGrid().find((col: any) => col.name == column);
    if (
      gridColumn &&
      rowData[gridColumn.name] != null &&
      rowData[gridColumn.name] != ''
    ) {
      /**
       * refScreenOnRowData is given as input in reference button which searches for data
       * based on refScreenOnRowData set here.
       */
      this.refScreenOnRowData.set({
        tableName: gridColumn.refTableName,
        queryID: gridColumn.refQueryID,
        columns: gridColumn.refColumns,
        rowId: rowData.rowid,
        refForColumn: gridColumn.name,
        selectedValue: rowData[gridColumn.name],
        defaultValue: this.refScreenDefaultValue(),
      });
    } else if (gridColumn) {
      gridColumn.refColumns?.forEach((refCol: any) => {
        if (refCol.mainScreenColumn) {
          rowData[refCol.mainScreenColumn] = null;
        }
      });
    }
  }

  /**
   * Method for validating single row
   * @param rowData
   * @returns a list of columns and a corresponding message
   */
  private async validateRowData(rowData: any): Promise<{ column: string }[]> {
    const errors: { column: string }[] = [];
    this.validationErrors = {}; // Reset validation errors

    for (const column of this.dataGrid()) {
      const value = rowData[column.name];

      // Required validation
      if (
        column.isRequired &&
        column.autogenerate !== true &&
        (value === null || value === '' || value === undefined)
      ) {
        errors.push({ column: column.name });
        this.validationErrors[column.name] = { errMsg: ERRMSG.E0009 };
      } else {
        this.validationErrors[column.name] = { errMsg: '' };
      }

      // check for negative inputs
      if (column.dataType === '2' && column.isPositiveOnly && value < 0) {
        errors.push({ column: column.name });
        this.validationErrors[column.name] = {
          errMsg: this.errMsgs.E0015,
        };
      }
    }

    return errors;
  }

  /**
   * This method is for the save the data when the add,edit and copy mode
   */
  async onSaveData(): Promise<boolean> {
    const errors = await this.validateRowData(this.currData);
    // reset save list
    this.saveList.AddList = [];
    this.saveList.UpdateList = [];
    this.saveList.DeleteList = [];

    if (errors.length > 0) {
      return false;
    }

    const dateColumnList = this.dataGridInp()
      .filter((field: any) => field.dataType === '3')
      .map((field) => field.name);
    const numberColumnList = this.dataGridInp()
      .filter((field: any) => field.dataType === '2')
      .map((field) => field.name);

    //date column conversion to UTC ISO format
    dateColumnList.forEach((columnName: string) => {
      if (this.currData.hasOwnProperty(columnName)) {
        this.currData[columnName] = this.ActyCommonService.getUtcIsoDate(
          this.currData[columnName]
        );
      }
    });

    // number column conversion to null if empty
    numberColumnList.forEach((columnName: string) => {
      if (this.currData.hasOwnProperty(columnName)) {
        this.currData[columnName] =
          this.currData[columnName] !== '' ? this.currData[columnName] : null;
      }
    });

    if (this.currentMode === 1 || this.currentMode === 3) {
      // Add mode
      this.saveList.AddList.push(this.currData);
    } else if (this.currentMode === 2) {
      if (this.DataChangeDetected.dataChangeList.length === 0) {
        this.messageService.add({
          severity: 'info',
          summary: INFOMSG.I0001,
        });
        return false;
      } else {
        // Edit mode
        this.saveList.UpdateList.push(this.currData);
      }
    }

    this.isLoading.emit(true);
    return new Promise((resolve) => {
      this.SaveDataService.saveData(this.saveList, this.saveURL()).subscribe({
        next: (res) => {
          this.hideDialog();
          this.isLoading.emit(false);
          if (res.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            resolve(true);
            this.hideDialog();
            this.getData();
          } else {
            resolve(false);
            this.hideDialog();
          }
        },
        error: (err) => {
          if (err.status === 409 && err.error.Message === 'EX1002') {
            for (const column of this.dataGrid()) {
              if (column.primaryKey) {
                this.validationErrors[column.name] = { errMsg: ERRMSG.E0008 };
              } else {
                this.validationErrors[column.name] = { errMsg: '' };
              }
            }
          }

          this.isLoading.emit(false);
          resolve(false);
        },
      });
    });
  }

  /**
   * onInput event to reset validation
   * @param inpName
   */
  onInput(inpName: string): void {
    if (this.validationErrors[inpName] !== undefined) {
      this.validationErrors[inpName].errMsg = '';
    }
  }

  /**
   * This method for the all current data and old data comparison to check value change
   */
  changeDetectValidate(field: string, columnData: any): boolean {
    const initialValue = (this.oldData as any)[field];

    const gridColumn = this.dataGridInp().find(
      (col: any) => col.name === field
    );
    if (gridColumn.isEditable === false || gridColumn.primaryKey === true) {
      return false;
    }

    if (gridColumn.dataType === '1') {
      if ((initialValue ?? '') !== (columnData ?? '')) {
        if (!this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListPush(field);
        }
      } else {
        if (this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListRemove(field);
        }
      }
    } else if (gridColumn.dataType === '2') {
      if (String(initialValue ?? '') !== String(columnData ?? '')) {
        if (!this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListPush(field);
        }
      } else {
        if (this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListRemove(field);
        }
      }
    } else if (gridColumn.dataType === '3') {
      if (
        this.ActyCommonService.getUtcIsoDate(columnData) !==
        this.ActyCommonService.getUtcIsoDate(initialValue)
      ) {
        if (!this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListPush(field);
        }
      } else {
        if (this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListRemove(field);
        }
      }
    } else if (gridColumn.dataType === '4') {
      if ((initialValue ?? '') !== (columnData ?? '')) {
        if (!this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListPush(field);
        }
      } else {
        if (this.DataChangeDetected.dataChangeList.includes(field)) {
          this.DataChangeDetected.dataChangeListRemove(field);
        }
      }
    }
    return true;
  }

  /**
   * This function is for the check the correct value is change or not if change then add bg color
   * @param id
   * @param columnData
   * @param dataType
   * @returns
   */
  checkValueChange(id: string, columnData: any, dataType: string): boolean {
    const initialValue = (this.oldData as any)[id];

    const gridColumn = this.dataGridInp().find((col: any) => col.name === id);
    if (gridColumn.isEditable === false || gridColumn.primaryKey === true) {
      return false;
    }

    if (gridColumn.dataType === '1') {
      return (initialValue ?? '') !== (columnData ?? '');
    } else if (gridColumn.dataType === '2') {
      return String(initialValue ?? '') !== String(columnData ?? '');
    } else if (gridColumn.dataType === '3') {
      return (
        this.ActyCommonService.getUtcIsoDate(columnData) !==
        this.ActyCommonService.getUtcIsoDate(initialValue)
      );
    } else if (gridColumn.dataType === '4') {
      return (initialValue ?? '') !== (columnData ?? '');
    }
    return false;
  }

  /**
   * This function is for the disable delete button and copy button when the data is not selected
   */
  deleteCopyButtonDisabled(buttonMode: number): boolean {
    if (JSON.stringify(this.selectedData) === JSON.stringify([null])) {
      setTimeout(() => {
        this.selectedData = [];
      }, 10);
      return true;
    } else if (!this.selectedData || !this.selectedData.length) {
      return true;
    } else {
      if (buttonMode === 2) {
        if (this.selectedData.length === 1) {
          return false;
        } else {
          return true;
        }
      } else {
        return false;
      }
    }
  }

  /**
   * Function to scroll down to the selected row
   */
  scrollToSelectedRow(): void {
    setTimeout(() => {
      const fullData = this.dataList() ?? [];
      const filteredData = this.dataTable?.filteredValue;
      const isFiltered =
        filteredData != null && filteredData.length < fullData.length;
      const visibleData = isFiltered ? filteredData : fullData;

      // Resolve selected data gracefully
      const selectedItem = Array.isArray(this.selectedData)
        ? this.selectedData[0]
        : this.selectedData;

      if (!selectedItem?.rowid || selectedItem.rowid <= 0) {
        return;
      }

      const selectedRowIdx = visibleData.findIndex(
        (row: any) => row.rowid === selectedItem.rowid
      );

      if (selectedRowIdx === -1) {
        this.selectedData = null;
        return;
      }

      const dtFirst = this.dataTable.first ?? 0;
      const dtRows = this.dataTable.rows ?? 0;

      // If already visible in current page
      if (selectedRowIdx >= dtFirst && selectedRowIdx < dtFirst + dtRows) {
        const tableBody = (
          this.dataTable as any
        ).el.nativeElement.querySelector('.p-datatable-table') as HTMLElement;

        let rowHeight: number = 40;

        if (tableBody) {
          const rows = tableBody.querySelectorAll('tr');

          if (rows.length >= 2) {
            const secondRow = rows[1] as HTMLElement;
            rowHeight = secondRow.offsetHeight;
          }
        }

        const scrollTop = rowHeight * (selectedRowIdx - dtFirst);

        this.dataTable.scrollTo({
          top: scrollTop,
        });
      } else {
        if (this.dataTable) {
          this.dataTable.first = selectedRowIdx - (selectedRowIdx % dtRows);
          this.scrollToSelectedRow();
        }
      }
    }, 50);
  }

  async alignFrozenColumnsLeft(): Promise<void> {
    // Wait for Angular to settle
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));

    const tableEl: HTMLElement = this.dataTable?.el?.nativeElement;
    if (!tableEl) return;

    // Step 1: Get all frozen <th> and calculate offsets
    const frozenHeaders = Array.from(
      tableEl.querySelectorAll('thead th.p-datatable-frozen-column')
    ) as HTMLTableCellElement[];

    const frozenLeftOffsets = new Map<string, number>();
    let left = 0;

    frozenHeaders.forEach((th) => {
      const label = th.getAttribute('data-label');

      th.style.left = `${left}px`;

      if (label) {
        frozenLeftOffsets.set(label, left);
      }

      left += th.offsetWidth;
    });

    // Step 2: Align all frozen <td> that have data-header (even hidden ones)
    const frozenTds = Array.from(
      tableEl.querySelectorAll('tbody td.p-datatable-frozen-column')
    ) as HTMLTableCellElement[];

    frozenTds.forEach((td) => {
      const headerLabel = td.getAttribute('data-header');

      if (!headerLabel || !frozenLeftOffsets.has(headerLabel)) return;

      const offset = frozenLeftOffsets.get(headerLabel)!;

      td.style.setProperty('left', `${offset}px`, 'important');
    });
  }

  showBorder(rowIndex: number, columnName: string): boolean {
    const intervalMap = this.bottomBorderInterval?.(); // get the interval config
    const interval = intervalMap?.[columnName];

    // If not defined, show border by default
    if (interval === undefined || interval === null) return true;

    // If defined and valid, use the rule
    return (rowIndex + 1) % interval === 0;
  }

  isDarkMode(): boolean {
    return this.layoutService._config.darkTheme ?? false;
  }

  getCellBackgroundColor(rowIndex: number, columnName: string): string | null {
    const { groupSize, rules } = this.rowColoring();
    if (!groupSize || groupSize <= 0 || !rules?.length) return null;

    const isDark = this.isDarkMode();
    const indexInGroup = rowIndex % groupSize;

    for (const rule of rules) {
      const { positionInGroup, color, darkModeColor, exemptColumns } = rule;

      if (
        indexInGroup === positionInGroup &&
        !exemptColumns?.includes(columnName)
      ) {
        return isDark ? darkModeColor ?? color : color;
      }
    }

    return null;
  }

  getColumnColor(columnName: string, isHeader: boolean): string | null {
    const isDark = this.isDarkMode();

    const rule = this.columnColoring().find((r) => r.columnName === columnName);
    if (!rule) return null;
    // Apply if:
    // - It's a header
    // - Or not header-only (i.e. apply to full column)
    if (!isHeader && rule.headerOnly === true) return null;

    return isDark ? rule.darkModeColor ?? rule.color : rule.color;
  }
}
