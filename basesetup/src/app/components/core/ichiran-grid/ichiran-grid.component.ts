import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  HostListener,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Table,
  TableFilterEvent,
  TableModule,
  TablePageEvent,
} from 'primeng/table';
import { TableOptionsComponent } from '../table-options/table-options.component';
import { FILTER } from '../../../model/core/filter.type';
import { SwapColumn } from '../../../model/core/swapColumn.type';
import { InputText } from 'primeng/inputtext';
import { ProgressSpinner } from 'primeng/progressspinner';
import { FormsModule } from '@angular/forms';
import { FilterService, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { JPTEXT } from '../../../shared/constants/jp-text';
import { SaveData } from '../../../model/core/saveData.type';
import { SaveDataService } from '../../../services/core/save-data.service';
import { MenuItem } from 'primeng/api';
import { MenuModule } from 'primeng/menu';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import {
  ERRMSG,
  INFOMSG,
  SUCCESSMSG,
  WARNMSG,
} from '../../../shared/constants/messages';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { ReferenceScreenButtonComponent } from '../reference-screen-button/reference-screen-button.component';
import { gridChangesReturn } from '../../../model/shared/grid-changes-guard.type';
import { ActyCommonService } from '../../../services/shared/acty-common.service';
import { DataChangeDetectedService } from '../../../services/core/data-change-detected.service';
import { CONFIG } from '../../../shared/constants/config';

@Component({
  selector: 'app-ichiran-grid',
  imports: [
    TableModule,
    TableOptionsComponent,
    MultiSelectModule,
    FormsModule,
    InputText,
    DatePicker,
    SelectModule,
    MaxLengthDirective,
    ReferenceScreenButtonComponent,
    MenuModule,
    ProgressSpinner,
  ],
  templateUrl: './ichiran-grid.component.html',
  styleUrl: './ichiran-grid.component.scss',
})
export class IchiranGridComponent implements OnInit, OnChanges, AfterViewInit {
  @ViewChild('dt') dataTable!: Table;

  // Outputs
  isLoading = output<boolean>();
  rowsChanged = output<number>();
  swapDataUpdated = output<Array<SwapColumn>>();
  sortDataChnaged = output();
  saveSuccess = output();
  getDataTrigger = output<boolean>();
  hideFilterKBNOut = output<string>();

  // Inputs
  dataGrid = input.required<any>();
  dataList = input.required<any>();
  _dataList = signal<any>([]);
  pageSize = input<number[]>(CONFIG.DEFAULT.PAGESIZES);
  isTableOptions = input<boolean>(false);
  exportBtn = input<boolean>(false);
  sortDataBtn = input<boolean>(false);
  swapColBtn = input<boolean>(false);
  searchList = input<Array<FILTER>>([]);
  exportURL = input<string>('');
  saveURL = input<string>('');
  formId = input<string>('');
  gridFilterShowInp = input<boolean>(false);
  confirmGridChanges = input<() => Promise<gridChangesReturn>>();
  isBackgroundLoading = input<boolean>(false);
  refDialog = input<any>();
  hidefilterbtn = input<boolean>(false);

  //injected services
  DataChangeDetected = inject(DataChangeDetectedService);
  ActyCommonServiceService = inject(ActyCommonService);

  // Signals
  //variable for managing height of the table div
  scrollHeight = signal<string>('400px');
  rows = signal(this.pageSize()[0]);
  pageSizeDrpDown = signal(this.pageSize()[0]);
  dataGridRow = signal<any>(null);
  selectedRowKey = signal<{ [key: string]: any } | null>(null);
  selectedRowData = computed(() => {
    const key = this.selectedRowKey();
    if (!key || Object.keys(key).length === 0) {
      return null;
    }

    const visibleData = this.visibleDataList();
    // when filter is applied then primeng datatable uses its filteredValue list
    const filteredValues = this.dataTable?.filteredValue;
    const isFiltered =
      filteredValues != null && filteredValues.length < visibleData.length;

    // Try to find selected row directly in filtered values
    if (isFiltered) {
      const matchInFiltered = filteredValues.find((row) =>
        Object.entries(key).every(([k, v]) => row[k] === v)
      );
      if (matchInFiltered) {
        return matchInFiltered;
      }

      // Try to find fallback row in visible list that exists in filtered list
      const startIndex = visibleData.findIndex((row: any) =>
        Object.entries(key).every(([k, v]) => row[k] === v)
      );

      if (startIndex !== -1) {
        // Search downward
        for (let i = startIndex + 1; i < visibleData.length; i++) {
          const next = visibleData[i];
          if (
            filteredValues.some((filtered) =>
              Object.entries(this.getRowPkData(next)).every(
                ([k, v]) => filtered[k] === v
              )
            )
          ) {
            const newKey = this.getRowPkData(next);
            if (
              JSON.stringify(newKey) !== JSON.stringify(this.selectedRowKey())
            ) {
            }

            return next;
          }
        }

        // Search upward
        for (let i = startIndex - 1; i >= 0; i--) {
          const prev = visibleData[i];
          if (
            filteredValues.some((filtered) =>
              Object.entries(this.getRowPkData(prev)).every(
                ([k, v]) => filtered[k] === v
              )
            )
          ) {
            const newKey = this.getRowPkData(prev);
            if (
              JSON.stringify(newKey) !== JSON.stringify(this.selectedRowKey())
            ) {
            }

            return prev;
          }
        }
      }

      // No fallback row found
      return null;
    }

    // No filtering: match directly in visibleData
    const match = visibleData.find((row: any) =>
      Object.entries(key).every(([k, v]) => row[k] === v)
    );

    return match ?? null;
  });

  copyRowdata = signal<any>([]);
  saveList = signal<SaveData>({
    AddList: [],
    UpdateList: [],
    DeleteList: [],
  });
  validationErrors = signal<string[]>([]);
  refScreenOnRowData = signal({
    tableName: '',
    columns: [],
    pkData: {},
    refForColumn: '',
    selectedValue: '',
  });
  gridFilterShow = signal<boolean>(false);
  primaryKeyColumns = signal<string[]>([]);
  tableFirst = signal<number>(0);
  preventPageReset = signal<boolean>(false);
  preventGridSort = signal<boolean>(false);
  invalidCellRowKeys = signal<{ [key: string]: any }[]>([]);
  filteredRows = computed(() => this.dataTable?.filteredValue ?? []);

  filterService = inject(FilterService);
  saveDataService = inject(SaveDataService);
  messageService = inject(MessageService);

  @ViewChild('dropdownRef') dropdownRef: any;

  //list of all the avaialble menus
  childMenuItems: MenuItem[] = [];

  //variable for all the texts stored in constants
  textContent = signal(JPTEXT);

  visibleDataList = signal<any>([]);
  multiSelectValues: { [key: string]: any } = {};

  matchModeOptionsStr: SelectItem[] = [
    {
      label: this.textContent().MATCH_CONDITIONS.startsWith,
      value: 'startsWith',
    },
    { label: this.textContent().MATCH_CONDITIONS.endsWith, value: 'endsWith' },
    { label: this.textContent().MATCH_CONDITIONS.contains, value: 'contains' },
    { label: this.textContent().MATCH_CONDITIONS.equals, value: 'equals' },
    {
      label: this.textContent().MATCH_CONDITIONS.notEquals,
      value: 'notEquals',
    },
    // { label: this.textContent().MATCH_CONDITIONS.isNull, value: 'isNull' },
    // {
    //   label: this.textContent().MATCH_CONDITIONS.isNotNull,
    //   value: 'isNotNull',
    // },
  ];

  matchModeOptionsNum: SelectItem[] = [
    { label: this.textContent().MATCH_CONDITIONS.greaterThan, value: 'gt' },
    { label: this.textContent().MATCH_CONDITIONS.lessThan, value: 'lt' },
    { label: this.textContent().MATCH_CONDITIONS.equals, value: 'equals' },
    {
      label: this.textContent().MATCH_CONDITIONS.notEquals,
      value: 'notEquals',
    },
    // { label: this.textContent().MATCH_CONDITIONS.isNull, value: 'isNull' },
    // {
    //   label: this.textContent().MATCH_CONDITIONS.isNotNull,
    //   value: 'isNotNull',
    // },
  ];

  matchModeOptionsDate: SelectItem[] = [
    {
      label: this.textContent().MATCH_CONDITIONS.greaterThan,
      value: 'dateAfter',
    },
    {
      label: this.textContent().MATCH_CONDITIONS.lessThan,
      value: 'dateBefore',
    },
    { label: this.textContent().MATCH_CONDITIONS.equals, value: 'dateIs' },
    {
      label: this.textContent().MATCH_CONDITIONS.notEquals,
      value: 'dateIsNot',
    },
    // { label: this.textContent().MATCH_CONDITIONS.isNull, value: 'isNull' },
    // {
    //   label: this.textContent().MATCH_CONDITIONS.isNotNull,
    //   value: 'isNotNull',
    // },
  ];

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    // Define custom filter constraints for NULL and NOT NULL
    this.filterService.register('isNull', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      return value === null || value === undefined || value === '';
    });

    this.filterService.register('isNotNull', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      return value !== null && value !== undefined && value !== '';
    });

    this.filterService.register('gt', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return value > filter;
    });

    this.filterService.register('lt', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return value < filter;
    });

    this.filterService.register('equals', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return value == filter;
    });

    this.filterService.register('notEquals', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return value != filter;
    });

    this.filterService.register('dateIs', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return new Date(value).toDateString() === new Date(filter).toDateString();
    });

    this.filterService.register('dateIsNot', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return new Date(value).toDateString() !== new Date(filter).toDateString();
    });

    this.filterService.register('dateBefore', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return new Date(value) < new Date(filter);
    });

    this.filterService.register('dateAfter', (value: any, filter: any) => {
      if (filter == null || filter === '') return true; // No filter applied
      if (!value) return false; // Don't check filter
      return new Date(value) > new Date(filter);
    });

    this.filterService.register('in', (value: any, filter: any[]) => {
      if (!filter || filter.length === 0) return true; // Show all when no filter selected
      const filterKeys = filter.map((f) => f.key); // Extract key from objects
      return filterKeys.includes(value);
    });

    this.childMenuItems = [
      {
        label: this.textContent().BTN_TEXT.EDITABLE_GRID_BUTTON.ADD_ROWS,
        icon: 'bi bi-file-plus',
        command: () => this.onAddRow(this.selectedRowData),
      },
      {
        label: this.textContent().BTN_TEXT.EDITABLE_GRID_BUTTON.DELETE_ROWS,
        icon: 'bi bi-trash',
        command: () => this.onDeleteRow(this.selectedRowData),
      },
      {
        label: this.textContent().BTN_TEXT.EDITABLE_GRID_BUTTON.COPY_ROWS,
        icon: 'bi bi-copy',
        command: () => this.onCopyRow(this.selectedRowData),
      },
      {
        label: this.textContent().BTN_TEXT.EDITABLE_GRID_BUTTON.PASTE_ROWS,
        icon: 'bi bi-clipboard-check-fill',
        command: () => this.onPasteRow(this.selectedRowData),
      },
    ];
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['gridFilterShowInp']) {
      this.gridFilterShow.set(this.gridFilterShowInp());
    }

    if (changes['dataList'] && this.dataTable) {
      this.tableFirst.set(0);
      //removing sorting and filter
      this.dataTable.clear();
      // clear multi-select selections in UI
      this.multiSelectValues = {};

      this._dataList.set(structuredClone(this.dataList()));
      this.visibleDataList.set(structuredClone(this.dataList()));

      this.copyRowdata.set([]); // Clear copied data
      if (this.visibleDataList().length > 0) {
        this.selectedRowKey.set(this.getRowPkData(this.visibleDataList()[0])); // Reset selection
      } else {
        this.selectedRowKey.set(null); // Reset selection
      }

      // reset save list
      this.saveList().AddList = [];
      this.saveList().UpdateList = [];
      this.saveList().DeleteList = [];

      this.DataChangeDetected.updateDataChangeKBN(false);
    }
    if (changes['dataGrid']) {
      // set primary key columns for current grid component
      this.primaryKeyColumns.set(
        this.dataGrid()
          .filter((column: any) => column.primaryKey === true)
          .map((column: any) => column.name)
      );
    }
  }

  ngAfterViewInit() {
    // Bind input events for pagination rows per page select
    /**
     * The setTimeout in this case is used to delay execution until after the current JavaScript call stack is cleared
     * and this.dropdownRef?.el?.nativeElement.querySelector('input') doesnot return null
     */
    setTimeout(() => {
      const inputEl: HTMLInputElement =
        this.dropdownRef?.el?.nativeElement.querySelector('input');

      if (inputEl) {
        inputEl.addEventListener('keydown', (event: KeyboardEvent) => {
          const allowedKeys = [
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
          const currentValue = inputEl.value;
          const selectionStart = inputEl.selectionStart ?? 0;
          const selectionEnd = inputEl.selectionEnd ?? 0;

          const nextValue =
            currentValue.slice(0, selectionStart) +
            event.key +
            currentValue.slice(selectionEnd);

          const numeric = parseInt(nextValue, 10);

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
              ? this.pageSize()[0]
              : numeric;

          inputEl.value = finalValue.toString();
          this.rows.set(finalValue);
          this.pageSizeDrpDown.set(finalValue);
          this.rowsChanged.emit(this.rows());
        });
      }
    });
  }
  /**
   * get the kbn value by its key from memberList
   * @param key
   * @param memberList
   * @returns
   */
  getKBNNm(key: string, memberList: { key: string; value: string }[]) {
    return memberList.find((l) => l.key === key);
  }

  /**
   * function for showing date in grid which is without time
   * @param date
   * @returns
   */
  getDateFormat(date: any): string {
    const parsedDate = new Date(date);
    if (!parsedDate || isNaN(parsedDate.getTime())) {
      return '';
    }

    return `${parsedDate.getFullYear()}/${(parsedDate.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${parsedDate.getDate().toString().padStart(2, '0')}`;
  }

  isLoadingStateChange(isLoadingState: boolean) {
    this.isLoading.emit(isLoadingState);
  }
  // returns the name and display name for visible columns in the grid
  gridColumnNameAndDisplayNameList = () => {
    return this.dataGrid()
      .filter((item: any) => item.visible)
      .map(({ name, displayName, dataType }: any) => ({
        name,
        displayName,
        dataType,
      }));
  };
  // returns the name and display name for all columns(visible or not) for the grid
  gridColumnNameAndDisplayNameListAll = () => {
    return this.dataGrid()
      .filter(({ gridIgnore }: any) => gridIgnore !== true)
      .map(({ name, displayName }: any) => ({
        name,
        displayName,
      }));
  };

  // This function returns the index of the row based on the primary key
  getNextEditableColumn(currentColumnName: string): string | null {
    const columns = this.dataGrid();
    let foundCurrent = false;

    for (const column of columns) {
      if (column.name === currentColumnName) {
        foundCurrent = true;
        continue;
      }

      if (foundCurrent && column.visible && column.isEditable) {
        return column.name;
      }
    }

    return null;
  }

  // This function focuses the next editable cell in the same row or the first editable cell in the next row
  focusNextEditableCell(rowIndex: number, currentColumnName: string): void {
    const nextColumnName = this.getNextEditableColumn(currentColumnName);

    const cellId = `${rowIndex}_${nextColumnName}`;
    const cell = document.getElementById(cellId);

    if (cell) {
      // Example: Focus the input inside the cell (if editable)
      const input = cell.querySelector('p-celleditor') as HTMLInputElement;
      if (input) {
        input.click();
      }
    } else {
      // If the next column is not found, move to the next row
      const nextRowIndex = rowIndex + 1;
      const firstEditableColumn = this.getFirstEditableColumn();

      if (firstEditableColumn) {
        const nextRowCellId = `${nextRowIndex}_${firstEditableColumn}`;
        const nextRowCell = document.getElementById(nextRowCellId);

        if (nextRowCell) {
          const input = nextRowCell.querySelector(
            'p-celleditor'
          ) as HTMLInputElement;
          if (input) {
            input.click();
          }
        }
      }
    }
  }

  // This function focuses the first editable cell in the row
  getFirstEditableColumn(): string | null {
    const columns = this.dataGrid();
    const firstEditableColumn = columns.find((col: any) => col.isEditable);
    return firstEditableColumn ? firstEditableColumn.name : null;
  }

  onSwapDataUpdate(newSwapData: Array<SwapColumn>) {
    this.swapDataUpdated.emit(newSwapData);
  }

  onSortDataChange() {
    this.sortDataChnaged.emit();
  }
  /**
   * fills up the remaining height of the screen with the grid by setting its height with that much px
   * @returns
   */
  updateScrollHeight() {
    setTimeout(() => {
      const dataDivHeight =
        document.querySelector('.dataDiv')?.clientHeight || 0;
      const paginationHeight = 51;

      // Calculate available height dynamically
      const availableHeight = dataDivHeight - paginationHeight;
      this.scrollHeight.set(`${availableHeight}px`);

      const dataDiv = document.querySelector(
        '.dataDiv .p-datatable-table-container'
      ) as HTMLElement;
      if (dataDiv) {
        dataDiv.style.height = this.scrollHeight();
        dataDiv.style.maxHeight = this.scrollHeight();
      }
    }, 50); // Small delay to ensure rendering is complete
  }

  @HostListener('window:resize')
  onResize() {
    this.updateScrollHeight();
  }

  getTotalRecords() {
    if (this.dataTable) {
      return this.dataTable.totalRecords;
    } else return 0;
  }
  /**
   * On column resize manually update the left of all th and td.
   * Need to do it because of frozen and sticky column combination bug of primeng
   * @param event
   */
  colResizeEvent(event: any) {
    const resizedTh = event.element as HTMLElement;
    // Update corresponding sticky <th>s in each row
    const table = resizedTh.closest('table') as HTMLElement;
    const allThRows = table.querySelectorAll('thead tr');

    allThRows.forEach((row: any) => {
      const tds: NodeListOf<HTMLElement> = row.querySelectorAll('th');

      let left = 0;
      tds.forEach((td, index) => {
        if (td.classList.contains('p-datatable-frozen-column')) {
          td.style.left = `${left}px`;
          left += td.offsetWidth;
        }
      });
    });

    // Update corresponding sticky <td>s in each row
    const allRows = table.querySelectorAll('tbody tr');

    allRows.forEach((row: any) => {
      const tds: NodeListOf<HTMLElement> = row.querySelectorAll('td');

      let left = 0;
      tds.forEach((td, index) => {
        if (td.classList.contains('p-datatable-frozen-column')) {
          td.style.left = `${left}px`;
          left += td.offsetWidth;
        }
      });
    });
  }

  /**
   * executes when rows per page dropdown selected item changes
   * @param event
   */
  OnRowChange(event: any) {
    if (event.originalEvent instanceof PointerEvent) {
      this.rows.set(event.value);
      this.rowsChanged.emit(this.rows());
    }
  }

  onRowSelect(rowData: any) {
    if (this.selectedRowData() != rowData) {
      this.selectedRowKey.set(this.getRowPkData(rowData));
    }
  }

  isRowSelected(rowData: any): boolean {
    const key = this.selectedRowKey();
    if (key == null) return false;
    // if selected row key and current row key matches then its marked as selected
    return (
      key &&
      Object.keys(key).length > 0 &&
      JSON.stringify(this.selectedRowKey()) ===
        JSON.stringify(this.getRowPkData(rowData))
    );
  }

  onAddRow(rowData: any) {
    const newRow: any = { _isNew: true };
    const currDate = new Date();
    const tempData = `tmp${currDate.getTime()}`;
    const selectedRowKey = this.selectedRowKey();
    const currentPageFirst: number = this.dataTable.first ?? 0; //current page first row index

    // Initialize all columns with empty values
    this.dataGrid().forEach((column: any) => {
      // If column is primary key, set tempData value
      if (column.primaryKey) {
        newRow[column.name] = tempData;
        return;
      }

      // Set default values based on data type if needed
      switch (column.dataType) {
        case '2':
          newRow[column.name] = null;
          break;
        case '3':
          newRow[column.name] = null;
          break;
        case '4':
          if (column.memberList.length > 0) {
            newRow[column.name] = column.memberList[0].key;
          } else {
            newRow[column.name] = null;
          }
          break;
        default:
          newRow[column.name] = null;
      }
    });

    if (this.selectedRowData() != null) {
      const _dataListIdx = this.rowIdx_VisibledataList(rowData());
      const insertIdx = _dataListIdx + 1;
      // append row in visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
      this.visibleDataList().splice(insertIdx, 0, structuredClone(newRow));
      // append row in _dataList
      this._dataList().splice(0, 0, structuredClone(newRow));
      this.selectedRowKey.set(this.getRowPkData(newRow));
    } else {
      // append row in visibleDataList (use splice because if reassigned then it will detect change in list and reset datatable)
      this.visibleDataList().splice(
        currentPageFirst,
        0,
        structuredClone(newRow)
      );
      // append row in _dataList
      this._dataList().splice(0, 0, structuredClone(newRow));

      this.selectedRowKey.set(this.getRowPkData(newRow));
    }
    this.preventGridSort.set(true); // prevent grid sorting reset
    this.preventPageReset.set(true); // prevent page reset from filter

    // Check for grid changes
    const isGridChanged = this.hasGridChanges();
    if (isGridChanged) {
      this.DataChangeDetected.updateDataChangeKBN(true);
    } else {
      this.DataChangeDetected.updateDataChangeKBN(false);
    }
  }

  onDeleteRow(rowData: any) {
    const selectedRowKey = this.selectedRowKey();

    if (selectedRowKey == null || rowData() == null) return;
    const visibleDataListIdx = this.rowIdx_VisibledataList(rowData());
    const nextRow =
      this.visibleDataList()[visibleDataListIdx + 1] ||
      this.visibleDataList()[visibleDataListIdx - 1];
    const nextRowPk = nextRow ? this.getRowPkData(nextRow) : {};

    this.preventGridSort.set(true);
    if (this.selectedRowData() != null) {
      if (!rowData()._isNew) {
        const _dataListIdx = this.rowIdx_dataList(rowData());
        this._dataList()[_dataListIdx]._isDelete = true;
      }
      const visibleListIdx = this.rowIdx_VisibledataList(rowData());

      const filteredValuesIdx = this.rowIdx_filteredValues(rowData());

      if (visibleListIdx !== -1) {
        // remove from visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
        this.visibleDataList().splice(visibleListIdx, 1);
      }
      if (filteredValuesIdx !== -1) {
        // remove from filteredValues which primeng table manages
        this.dataTable.filteredValue?.splice(filteredValuesIdx, 1);
      }

      this.preventGridSort.set(true); // prevent grid sorting reset
      this.preventPageReset.set(true); // prevent page reset from filter
      this.selectedRowKey.set(nextRowPk); // set new selected row
    }

    // Check for grid changes
    const isGridChanged = this.hasGridChanges();
    if (isGridChanged) {
      this.DataChangeDetected.updateDataChangeKBN(true);
    } else {
      this.DataChangeDetected.updateDataChangeKBN(false);
    }
  }

  onCopyRow(rowData: any) {
    this.copyRowdata.set(this.formatRowData(rowData()));
  }

  onPasteRow(rowData: any) {
    // Check if there's any data to paste
    if (!this.copyRowdata() || this.copyRowdata().length === 0) {
      return; // Exit if no data to paste
    }
    const tempData = `tmp${new Date().getTime()}`;
    const newRow = { _isNew: true, ...this.copyRowdata() };
    if (this.selectedRowData() !== null) {
      const visibleList = [...this.visibleDataList()];
      const Idx = this.rowIdx_VisibledataList(rowData());

      // Initialize all columns with empty values
      this.dataGrid().forEach((column: any) => {
        // If column is primary key, set tempData value
        if (column.primaryKey) {
          newRow[column.name] = tempData;
          return;
        }
      });

      // Add new row after the selected row(use splice because if reassigned then it will detect change in list and reset datatable)
      visibleList.splice(Idx + 1, 0, structuredClone(newRow));
      // use structuredClone so that when visibleList's row is changed _dataList's row doesnot change
      this._dataList().splice(0, 0, structuredClone(newRow));
      this.visibleDataList.set([...visibleList]);
      this.selectedRowKey.set(this.getRowPkData(newRow)); // Move to the newly added row
    }
    this.preventGridSort.set(true); // prevent grid sorting reset
    this.preventPageReset.set(true); // prevent page reset from filter

    // Check for grid changes
    const isGridChanged = this.hasGridChanges();
    if (isGridChanged) {
      this.DataChangeDetected.updateDataChangeKBN(true);
    } else {
      this.DataChangeDetected.updateDataChangeKBN(false);
    }
  }

  /**
   * method for validating single row
   * @param rowData
   * @returns a list of columns and a corresponding message
   */
  private async validateRowData(
    rowData: any
  ): Promise<{ column: string; message: string }[]> {
    const errors: { column: string; message: string }[] = [];

    for (const column of this.dataGrid()) {
      const value = rowData[column.name];

      // Required validation
      if (
        column.isRequired &&
        (value === null || value === '' || value === undefined)
      ) {
        errors.push({
          column: column.name,
          message: this.textContent().CELL_VALIDATIONS.REQUIRED,
        });
        continue;
      }

      // Reference validation
      if (
        rowData[column.name] != '' &&
        rowData[column.name] != null &&
        column.isReferenceScreen &&
        !column.primaryKey
      ) {
        // set the data for reference
        this.refDialog()._columns.set(column.refColumns);
        this.refDialog()._tableName.set(column.refTableName);
        this.refDialog()._refForColumn.set(column.name);
        this.refDialog()._selectedValue.set(rowData[column.name]);
        this.refDialog()._pkData.set(this.getRowPkData(rowData));

        this.refDialog().initializeSearchList('2');

        //wait to get reference data
        await this.refDialog().getData();
        const gridData = this.refDialog().gridData();

        // if data not found set error
        if (gridData.length > 0) {
          const selectedRefRow = gridData[0];

          this.onReferenceDataSelected({
            refForColumn: this.refDialog()._refForColumn,
            selectedValue: selectedRefRow[this.refDialog()._refForColumn],
            mainScreenColumnValues:
              this.refDialog().setMainScreenColumnValues(selectedRefRow),
            pkData: this.refDialog()._pkData(),
          });
        } else {
          errors.push({
            column: column.name,
            message: this.textContent().CELL_VALIDATIONS.INVALID_INPUT,
          });
          continue;
        }
      }
    }

    return errors;
  }

  /**
   * adds the invalidCells property in row
   * @param row always pass row byRef
   * @param columns object of column name and its error message
   */
  addInvalidCells(row: any, columns: { column: string; message: string }[]) {
    if (row.invalidCells == undefined) {
      row.invalidCells = [];
    }
    columns.forEach((clm) => {
      row.invalidCells.push(clm);
    });
  }

  isInvalidCell(row: any, column: string): boolean {
    return (
      row.invalidCells != undefined &&
      row.invalidCells.some(
        (cell: { column: string; message: string }) => cell.column === column
      )
    );
  }
  /**
   * returns the invalid message for columnName form data
   * @param data
   * @param columnName
   * @returns
   */
  getInvalidMessage(data: any, columnName: string): string {
    return (
      data?.invalidCells?.find((cell: any) => cell?.column === columnName)
        ?.message || 'Error'
    );
  }

  async onSaveData(): Promise<boolean> {
    let validationFailed = false;
    this.saveList().AddList = [];
    this.saveList().UpdateList = [];
    this.saveList().DeleteList = [];

    if (this._dataList().length === 0) {
      return false;
    }

    // make addList (use async for validations)
    const addListPromises = this.visibleDataList().map(
      async (row: any, index: number) => {
        if (row._isNew) {
          const invalidColumns = await this.validateRowData(row);
          if (invalidColumns.length > 0) {
            validationFailed = true;
            this.addInvalidCells(row, invalidColumns);
            this.invalidCellRowKeys().push(this.getRowPkData(row));
          }
          return this.formatRowData(row);
        }
        return null;
      }
    );

    // make updateList
    const updateListPromises = this.visibleDataList().map(
      async (row: any, index: number) => {
        if (row.changedCells?.length > 0) {
          const invalidColumns = await this.validateRowData(row);
          if (invalidColumns.length > 0) {
            validationFailed = true;
            this.addInvalidCells(row, invalidColumns);
            this.invalidCellRowKeys().push(this.getRowPkData(row));
          }
          return this.formatRowData(row);
        }
        return null;
      }
    );

    // Wait for all validation/formatting
    const addListResults = await Promise.all(addListPromises);
    const updateListResults = await Promise.all(updateListPromises);

    this.saveList().AddList = addListResults.filter((row) => row !== null);
    this.saveList().UpdateList = updateListResults.filter(
      (row) => row !== null
    );

    // if there are errors then show error
    if (validationFailed) {
      this.messageService.add({
        severity: 'error',
        summary: ERRMSG.E0007,
      });
      //const minRowIndex = Math.min(...this.invalidCellRowKeys());
      const firstInvalidCell = this.invalidCellRowKeys()[0];

      if (this.dataTable && this.dataTable.rows) {
        this.restoreTableFirst();
        this.selectedRowKey.set(firstInvalidCell); // select first invalid row
        this.scrollToSelectedRow();
        this.invalidCellRowKeys.set([]);
      }

      return false;
    }

    // make deleteList
    this.saveList().DeleteList = this._dataList().filter(
      (row: any) => row._isDelete
    );

    if (
      this.saveList().AddList.length === 0 &&
      this.saveList().UpdateList.length === 0 &&
      this.saveList().DeleteList.length === 0
    ) {
      this.messageService.add({
        severity: 'info',
        summary: INFOMSG.I0002,
      });
      return false;
    }

    this.isLoading.emit(true);
    return new Promise((resolve) => {
      this.saveDataService.saveData(this.saveList(), this.saveURL()).subscribe({
        next: (res) => {
          this.isLoading.emit(false);
          if (res.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            this.saveSuccess.emit();
            resolve(true);
          } else {
            resolve(false);
          }
        },
        error: (err) => {
          this.isLoading.emit(false);
          resolve(false);
        },
      });
    });
  }

  hasGridChanges() {
    const hasNewOrChanged = this.visibleDataList().some(
      (row: any) =>
        row._isNew === true || (row.changedCells && row.changedCells.length > 0)
    );

    // check deleted from _dataList because those rows are removed from visibleDataList
    const hasDeleted = this._dataList().some(
      (row: any) => row._isDelete === true
    );

    return hasNewOrChanged || hasDeleted;
  }
  /**
   * Formats the data based on its data type
   * currently used for date and number
   * @param rowData
   * @returns
   */
  private formatRowData(rowData: any): any {
    const formattedData: any = {};

    this.dataGrid().forEach((column: any) => {
      if (column.gridIgnore !== true && column.visible !== false) {
        const value = rowData[column.name];

        // Format based on dataType
        switch (column.dataType) {
          case '2': // Number
            formattedData[column.name] =
              value === '' || value === null ? null : Number(value);
            break;

          case '3': // Date
            if (value) {
              const date = new Date(value);
              // Reset time to 00:00:00
              date.setHours(0, 0, 0, 0);
              formattedData[column.name] =
                this.ActyCommonServiceService.getUtcIsoDate(date);
            } else {
              formattedData[column.name] = null;
            }
            break;

          default: // String and other types
            formattedData[column.name] =
              value === '' || value === null ? null : value;
        }
      }
    });

    return formattedData;
  }
  /**
   * When done input then this is executed
   * @param rowData
   * @param column
   * @param hasReferenceScreen
   */
  onInputFinished(rowData: any, column: string, hasReferenceScreen: boolean) {
    // if it has reference screen then get its ref data by setting this.refScreenOnRowData
    if (hasReferenceScreen) {
      this.setRefScreenRowData(rowData, column);
    }
  }
  /**
   * function will set refScreenOnRowData which is used for getting reference data without opening the reference screen
   * @param rowData
   * @param column
   */
  setRefScreenRowData(rowData: any, column: string) {
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
        columns: gridColumn.refColumns,
        pkData: this.getRowPkData(rowData),
        refForColumn: gridColumn.name,
        selectedValue: rowData[gridColumn.name],
      });
    } else if (gridColumn) {
      gridColumn.refColumns?.forEach((refCol: any) => {
        if (refCol.mainScreenColumn) {
          rowData[refCol.mainScreenColumn] = null;
        }
      });
    }
  }

  isCellEdited(row: any, column: string): boolean {
    return row.changedCells != undefined && row.changedCells.includes(column);
  }
  // when data is selected from reference screen this function will be ececuted to set that data
  onReferenceDataSelected(event: {
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
    pkData: { [key: string]: any };
  }) {
    const pkData = event.pkData;
    const rowData = this.visibleDataList().find((row: any) =>
      Object.keys(pkData).every((key) => row[key] === pkData[key])
    );

    for (const item of event.mainScreenColumnValues) {
      const column = item.key;
      const value = item.value;

      if ((value == null || value === '') && event.refForColumn === column) {
        this.messageService.add({
          severity: 'warn',
          summary: WARNMSG.W0001,
        });
      }

      rowData[column] = value;
      this.checkValueChange(rowData, column);
    }

    // Clear ref screen data
    this.refScreenOnRowData.set({
      tableName: '',
      columns: [],
      pkData: {},
      refForColumn: '',
      selectedValue: '',
    });
  }

  clearAllFilters() {
    if (this.dataTable) {
      for (const key in this.dataTable.filters) {
        const filter = this.dataTable.filters[key];

        if (Array.isArray(filter)) {
          filter.forEach((f) => (f.value = null));
        } else if (filter) {
          filter.value = null;
        }
      }
      this.dataTable._filter(); // re-apply

      // clear multi-select selections in UI
      this.multiSelectValues = {};
    }
  }

  toggleGridFilter() {
    this.gridFilterShow.set(!this.gridFilterShow());
  }
  //check if the value is changed then add change the backgroud color
  checkValueChange(rowData: any, column: string) {
    setTimeout(() => {
      if (rowData.invalidCells != undefined) {
        rowData.invalidCells = rowData.invalidCells.filter(
          (clm: any) => clm.column != column
        );
      }

      const gridColumn = this.dataGrid().find(
        (col: any) => col.name === column
      );

      // Mark non-editable cells
      if (!gridColumn.isEditable) {
        if (!rowData.nonEditableCells) rowData.nonEditableCells = [];
        if (!rowData.nonEditableCells.includes(column)) {
          rowData.nonEditableCells.push(column);
        }
      }

      // Only track changes for existing rows and editable columns
      if (!rowData._isNew && gridColumn.isEditable) {
        const _dataListRowIdx = this.rowIdx_dataList(rowData);
        const originalRow = this._dataList()[_dataListRowIdx];

        const originalValue =
          gridColumn.dataType === '3' && originalRow[column] != null
            ? this.ActyCommonServiceService.getUtcIsoDate(originalRow[column])
            : originalRow[column];

        let currentValue =
          gridColumn.dataType === '3' && rowData[column] != null
            ? this.ActyCommonServiceService.getUtcIsoDate(rowData[column])
            : rowData[column];

        if (currentValue === '') {
          currentValue = null;
        }

        if (!rowData.changedCells) {
          rowData.changedCells = [];
        }

        if (originalValue !== currentValue) {
          if (!rowData.changedCells.includes(column)) {
            rowData.changedCells.push(column);
          }
        } else {
          rowData.changedCells = rowData.changedCells.filter(
            (clm: string) => clm !== column
          );
        }
      }

      // Check for grid changes
      const isGridChanged = this.hasGridChanges();
      if (isGridChanged) {
        this.DataChangeDetected.updateDataChangeKBN(true);
      } else {
        this.DataChangeDetected.updateDataChangeKBN(false);
      }
    }, 10);
  }

  rowIdx_filteredValues(row: any): number {
    const pkColumns = this.primaryKeyColumns();
    return (
      this.dataTable.filteredValue?.findIndex((r: any) =>
        pkColumns.every((key: string) => r[key] === row[key])
      ) ?? -1
    );
  }

  rowIdx_VisibledataList(row: any): number {
    const pkColumns = this.primaryKeyColumns();
    return this.visibleDataList().findIndex((r: any) =>
      pkColumns.every((key: string) => r[key] === row[key])
    );
  }

  rowIdx_dataList(row: any): number {
    const pkColumns = this.primaryKeyColumns();
    return this._dataList().findIndex((r: any) =>
      pkColumns.every((key: string) => r[key] === row[key])
    );
  }

  pageChange(event: TablePageEvent) {
    this.tableFirst.set(event.first);

    const visibleData = this.visibleDataList();
    const firstRow = visibleData[event.first];

    if (firstRow) {
      this.selectedRowKey.set(this.getRowPkData(firstRow));
    }
  }
  /**
   * Sets the dataTable's first with the this.tableFirst()
   * Used for insert cases like insert on page's first or delete the first row of page
   */
  restoreTableFirst() {
    if (this.dataTable) {
      this.dataTable.first = this.tableFirst();
      this.scrollToSelectedRow();
    }
  }
  /**
   * Function to scroll down to the selected row
   */
  scrollToSelectedRow() {
    setTimeout(() => {
      const key = this.selectedRowKey();
      const fullData = this.visibleDataList() ?? [];
      const filteredData = this.dataTable?.filteredValue;
      const isFiltered =
        filteredData != null && filteredData.length < fullData.length;
      // if filter is applied then use filteredData whcih used by primeng datatable
      const visibleData = isFiltered ? filteredData : fullData;

      if (!key || Object.keys(key).length === 0 || visibleData.length == 0) {
        return;
      }

      const selectedRowIdx = visibleData.findIndex((row: any) =>
        Object.entries(key).every(([k, v]) => row[k] === v)
      );

      if (selectedRowIdx === -1) {
        this.setSelectedRow(this.getRowPkData(visibleData[0]));
      }

      const dtFirst = this.dataTable.first ?? 0;
      const dtRows = this.dataTable.rows ?? 0;

      // If already visible in current page
      if (selectedRowIdx >= dtFirst && selectedRowIdx < dtFirst + dtRows) {
        const tableBody = document.querySelector(
          '.dataDiv .p-datatable-table-container'
        ) as HTMLElement;

        if (tableBody) {
          const rowElement =
            tableBody.querySelectorAll('tr')[
              (selectedRowIdx % dtRows) + 2 // +2 for sticky headers
            ];

          if (rowElement) {
            (rowElement as HTMLElement).scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      } else {
        // Change pagination to show selected row
        this.tableFirst.set(selectedRowIdx - (selectedRowIdx % dtRows));
        this.restoreTableFirst();
      }

      this.cdr.detectChanges();
    }, 50);
  }

  onGridFilter(event: TableFilterEvent) {
    if (this.preventPageReset()) {
      this.preventPageReset.set(false);
      return;
    }

    this.tableFirst.set(0);
    if (this.dataTable) {
      this.dataTable.first = 0;

      // Select first visible row after filter
      const firstRow = this.visibleDataList()[0];
      if (firstRow) {
        this.selectedRowKey.set(this.getRowPkData(firstRow));
      }
    }
  }

  onGridSort(event: SortEvent) {
    if (this.preventGridSort()) {
      this.preventGridSort.set(false);
      return;
    }
    this.tableFirst.set(0);
    if (this.dataTable) {
      this.dataTable.first = 0;

      // Select first visible row after sort
      const firstRow = this.visibleDataList()[0];
      if (firstRow) {
        this.selectedRowKey.set(this.getRowPkData(firstRow));
      }
    }
  }

  onGetDataTrigger(event: boolean) {
    this.getDataTrigger.emit(event);
  }
  /**
   * using current component's this.primaryKeyColumns(), it will make an key value pair for columns in this.primaryKeyColumns()
   * the values will be set from rowData
   * @param rowData
   * @returns
   */
  getRowPkData(rowData: any) {
    const pkCols = this.primaryKeyColumns();
    const pkData: { [key: string]: any } = {};

    pkCols.forEach((col) => {
      pkData[col] = rowData[col];
    });

    return pkData;
  }

  customSort(event: SortEvent) {
    if (event.data) {
      event.data.sort((data1, data2) => {
        let value1 = data1[event.field ?? 0];
        let value2 = data2[event.field ?? 0];

        if (value1 == null) return -1;
        if (value2 == null) return 1;

        return value1 < value2 ? -1 : value1 > value2 ? 1 : 0;
      });

      if (event.order === -1) {
        event.data.reverse();
      }
    }
  }
  /**
   * sorts the grid
   * @param field
   * @param order
   */
  setGridSort(field: string, order: number) {
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
  setGridFilter(filterData: any) {
    for (const field in filterData) {
      if (
        filterData[field].value !== null &&
        filterData[field].value !== undefined
      ) {
        const { value, matchMode } = filterData[field];
        this.dataTable.filter(value, field, matchMode);
      }
    }
  }
  /**
   * selects the row based on rowPkData
   * @param rowPkData
   */
  setSelectedRow(rowPkData: { [key: string]: any } | null) {
    this.selectedRowKey.set(rowPkData);
    this.scrollToSelectedRow();
  }

  //pass hideFilterKBN to parent component
  hideFilterKBNChanged(filterkbn: any) {
    this.hideFilterKBNOut.emit(filterkbn);
  }
}
