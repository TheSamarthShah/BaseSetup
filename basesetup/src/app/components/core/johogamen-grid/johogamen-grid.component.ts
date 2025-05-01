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
import { ProgressSpinner } from 'primeng/progressspinner';
import { Checkbox } from 'primeng/checkbox';
import { CellSummaryComponent } from '../cell-summary/cell-summary.component';
import { TableOptionsComponent } from '../table-options/table-options.component';
import { FILTER } from '../../../model/core/filter.type';
import { SwapColumn } from '../../../model/core/swapColumn.type';
import { InputText } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { FilterService, MenuItem, SortEvent } from 'primeng/api';
import { SelectItem } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';
import { JPTEXT } from '../../../shared/constants/jp-text';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { Router } from '@angular/router';
import { FormStateService } from '../../../services/base/form-state.service';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TieredMenu } from 'primeng/tieredmenu';
import { CONFIG } from '../../../shared/constants/config';

@Component({
  selector: 'app-johogamen-grid',
  imports: [
    TableModule,
    CellSummaryComponent,
    TableOptionsComponent,
    ProgressSpinner,
    MultiSelectModule,
    FormsModule,
    InputText,
    DatePicker,
    SelectModule,
    MaxLengthDirective,
    Checkbox,
    SplitButtonModule,
    TieredMenu,
  ],
  templateUrl: './johogamen-grid.component.html',
  styleUrl: './johogamen-grid.component.scss',
})
export class JohogamenGridComponent
  implements OnInit, OnChanges, AfterViewInit
{
  // Outputs
  cellClick = output<any>();
  selectedCellsChange = output<Set<string>>();
  selectedValuesChange = output<any[]>();
  isLoading = output<boolean>();
  rowsChanged = output<number>();
  swapDataUpdated = output<Array<SwapColumn>>();
  sortDataChnaged = output();
  hideFilterKBNOut = output<string>();

  // Inputs
  dataGrid = input.required<any>();
  dataList = input.required<any>();
  pageSize = input<number[]>(CONFIG.DEFAULT.PAGESIZES);
  isCellSummary = input<boolean>(false);
  isTableOptions = input<boolean>(false);
  exportBtn = input<boolean>(false);
  sortDataBtn = input<boolean>(false);
  swapColBtn = input<boolean>(false);
  searchList = input<Array<FILTER>>([]);
  exportURL = input<string>('');
  isBackgroundLoading = input<boolean>(false);
  formId = input<string>('');
  gridFilterShowInp = input<boolean>(false);
  printCheckBox = input<boolean>(false);
  showSanshoModeBtn = input<boolean>(true);
  showHenshuModeBtn = input<boolean>(true);
  showAddModeBtn = input<boolean>(true);
  showCopyModeBtn = input<boolean>(true);
  hidefilterbtn = input<boolean>(false);

  // Signals
  //variable for managing height of the table div
  scrollHeight = signal<string>('400px');
  rows = signal(this.pageSize()[0]);
  pageSizeDrpDown = signal(this.pageSize()[0]);
  _dataList = signal<any>(null);
  selectedCells = signal<Set<string>>(new Set());
  isCtrlPressed = signal<boolean>(false);
  isShiftPressed = signal<boolean>(false);
  isMouseDownOnCell = signal<boolean>(false); // Track if mouse down started in a cell
  isCellModeEnabled = signal<boolean>(false);
  options = signal<any[]>([]);
  computedValues = signal<Record<string, string>>({});
  lastSelectedCell = signal<{ rowIndex: number; columnName: string } | null>(
    null
  );
  isDragged = signal<boolean>(false);
  selectAllPrint = signal<boolean>(false);
  gridFilterShow = signal<boolean>(false);
  primaryKeyColumns = signal<string[]>([]);
  selectedRowKey = signal<{ [key: string]: any } | null>(null);
  selectedRowData = computed(() => {
    const key = this.selectedRowKey();

    if (!key || Object.keys(key).length === 0) {
      return null;
    }

    const _dataList = this._dataList() == null ? [] : this._dataList();
    const filteredValues = this.dataTable?.filteredValue;
    const isFiltered =
      filteredValues != null && filteredValues.length < _dataList.length;

    // Try to find selected row directly in filtered values
    if (isFiltered) {
      const matchInFiltered = filteredValues.find((row) =>
        Object.entries(key).every(([k, v]) => row[k] === v)
      );
      if (matchInFiltered) {
        return matchInFiltered;
      }

      // Try to find fallback row in visible list that exists in filtered list
      const startIndex = _dataList.findIndex((row: any) =>
        Object.entries(key).every(([k, v]) => row[k] === v)
      );

      if (startIndex !== -1) {
        // Search downward
        for (let i = startIndex + 1; i < _dataList.length; i++) {
          const next = _dataList[i];
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
          const prev = _dataList[i];
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

    const match = _dataList.find((row: any) =>
      Object.entries(key).every(([k, v]) => row[k] === v)
    );

    return match ?? null;
  });
  tableFirst = signal<number>(0);

  @ViewChild('dt') dataTable!: Table;
  @ViewChild('dropdownRef') dropdownRef: any;

  filterService = inject(FilterService);
  messageService = inject(MessageService);
  router = inject(Router);
  formStateService = inject(FormStateService);

  //variable for all the texts stored in constants
  textContent = signal(JPTEXT);

  multiSelectValues: { [key: string]: any } = {};

  //This list is for dropdown options for text column
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

  //This List of number type options for dropdown
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

  //Filter list results between two dates
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

  //sansho screen option to open in new tab or new window
  torokuOpenWith_0: MenuItem[] = [
    {
      label: this.textContent().TOROKU.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(0, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.textContent().TOROKU.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(0, 'window'), // new window
    },
  ];

  //New mode screen option to open in new tab or new window
  torokuOpenWith_1: MenuItem[] = [
    {
      label: this.textContent().TOROKU.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(1, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.textContent().TOROKU.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(1, 'window'), // new window
    },
  ];

  //Edit mode screen option to open in new tab or new window
  torokuOpenWith_2: MenuItem[] = [
    {
      label: this.textContent().TOROKU.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(2, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.textContent().TOROKU.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(2, 'window'), // new window
    },
  ];

  //copy mode screen option to open in new tab or new window
  torokuOpenWith_3: MenuItem[] = [
    {
      label: this.textContent().TOROKU.OPEN_TAB,
      command: () => this.navigateWithEncodedMode(5, 'tab'), // new tab
    },
    { separator: true },
    {
      label: this.textContent().TOROKU.OPEN_WINDOW,
      command: () => this.navigateWithEncodedMode(5, 'window'), // new window
    },
  ];

  // Show menu button on small screens
  // Menu options: sansho, New, Edit, Copy
  torokuTieredMenu: MenuItem[] = [
    {
      label: this.textContent().TOROKU.REF,
      items: [
        {
          label: this.textContent().TOROKU.OPEN_SAME,
          command: () => this.navigateWithEncodedMode(0, 'same'), // new tab
        },
        { separator: true },
        ...this.torokuOpenWith_0,
      ],
      disabled: this.selectedRowData() == null,
    },
    {
      label: this.textContent().TOROKU.UPDATE,
      items: [
        {
          label: this.textContent().TOROKU.OPEN_SAME,
          command: () => this.navigateWithEncodedMode(2, 'same'), // new tab
        },
        { separator: true },
        ...this.torokuOpenWith_2,
      ],
      disabled: this.selectedRowData() == null,
    },
    {
      label: this.textContent().TOROKU.ADD,
      items: [
        {
          label: this.textContent().TOROKU.OPEN_SAME,
          command: () => this.navigateWithEncodedMode(1, 'same'), // new tab
        },
        { separator: true },
        ...this.torokuOpenWith_1,
      ],
    },
    {
      label: this.textContent().TOROKU.COPY,
      items: [
        {
          label: this.textContent().TOROKU.OPEN_SAME,
          command: () => this.navigateWithEncodedMode(5, 'same'), // new tab
        },
        { separator: true },
        ...this.torokuOpenWith_3,
      ],
    },
  ];

  onTieredMenuShow() {
    // need to assign same values to make it detect disable condition change
    this.torokuTieredMenu = [
      {
        label: this.textContent().TOROKU.REF,
        items: [
          {
            label: this.textContent().TOROKU.OPEN_SAME,
            command: () => this.navigateWithEncodedMode(0, 'same'),
          },
          { separator: true },
          ...this.torokuOpenWith_0,
        ],
        disabled: this.selectedRowData() == null,
        visible: this.showSanshoModeBtn(),
      },
      {
        label: this.textContent().TOROKU.UPDATE,
        items: [
          {
            label: this.textContent().TOROKU.OPEN_SAME,
            command: () => this.navigateWithEncodedMode(2, 'same'),
          },
          { separator: true },
          ...this.torokuOpenWith_2,
        ],
        disabled: this.selectedRowData() == null,
        visible: this.showHenshuModeBtn(),
      },
      {
        label: this.textContent().TOROKU.ADD,
        items: [
          {
            label: this.textContent().TOROKU.OPEN_SAME,
            command: () => this.navigateWithEncodedMode(1, 'same'),
          },
          { separator: true },
          ...this.torokuOpenWith_1,
        ],
        visible: this.showAddModeBtn(),
      },
      {
        label: this.textContent().TOROKU.COPY,
        items: [
          {
            label: this.textContent().TOROKU.OPEN_SAME,
            command: () => this.navigateWithEncodedMode(5, 'same'),
          },
          { separator: true },
          ...this.torokuOpenWith_3,
        ],
        visible: this.showCopyModeBtn(),
      },
    ];
  }
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

      this.selectAllPrint.set(false);

      const updatedList = this.dataList().map((item: any) => ({
        ...item,
        printChecked: false,
      }));

      this._dataList.set(updatedList);

      if (this._dataList() != null && this._dataList().length > 0) {
        this.selectedRowKey.set(this.getRowPkData(this._dataList()[0])); // Reset selection
      } else {
        this.selectedRowKey.set(null); // Reset selection
      }
    }

    if (changes['dataGrid']) {
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

  // Host Listeners for key & mouse events
  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent) {
    if (event.ctrlKey) this.isCtrlPressed.set(true);
    if (event.shiftKey) this.isShiftPressed.set(true);
  }

  @HostListener('document:keyup', ['$event'])
  onKeyup(event: KeyboardEvent) {
    if (!event.ctrlKey) this.isCtrlPressed.set(false);
    if (!event.shiftKey) this.isShiftPressed.set(false);
  }

  @HostListener('document:mousedown', ['$event'])
  onMouseDown(event: MouseEvent) {
    // If clicked outside the table, reset selection behavior
    if (!(event.target as HTMLElement).closest('table.p-datatable')) {
      this.isMouseDownOnCell.set(false);
    }
  }

  @HostListener('document:mouseup', ['$event'])
  onMouseUp(event: MouseEvent) {
    this.isMouseDownOnCell.set(false);
  }

  @HostListener('click', ['$event'])
  onGridClick(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // If clicking outside of a data cell, clear selection
    if (
      !this.isDragged() &&
      !target.closest('.p-datatable-tbody td') &&
      !target.closest('.cellSummary') &&
      !target.closest('.summaryHeader') &&
      !target.closest('.cellSummaryOutput .p-dialog')
    ) {
      this.clearSelection();
    } else {
      this.isDragged.set(false);
      //call copy functionality when Ctrl + C is pressed
      this.copySelectedCellsToClipboard();
    }
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
   * This function is convert the UTC date formate to YYYY/MM/DD (JP formate) and return string
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
  /**
   * Handles multiple cases when a cell is clicked. Cases like select call and if shift is presses then select all cells in between previous and current selected cell
   * and if ctrl is pressed then toggle the selection for that cell
   * @param rowData
   * @param column
   * @param rowIndex
   * @param event
   * @returns
   */
  onCellClick(rowData: any, column: any, rowIndex: number, event: MouseEvent) {
    event.stopPropagation();
    if (!this.isCellModeEnabled()) {
      this.clearSelection();
      return;
    }

    const cellKey = `${rowIndex}-${column.name}`;
    let currentSelectedCells = new Set(this.selectedCells());

    //This condition is for the press shift kry then click to select multiple cells
    if (this.isShiftPressed()) {
      // Shift + Click: Select range of cells
      if (this.lastSelectedCell()) {
        const startRow = Math.min(this.lastSelectedCell()!.rowIndex, rowIndex);
        const endRow = Math.max(this.lastSelectedCell()!.rowIndex, rowIndex);
        const startColumn = this.dataGrid().findIndex(
          (col: any) => col.name === this.lastSelectedCell()!.columnName
        );
        const endColumn = this.dataGrid().findIndex(
          (col: any) => col.name === column.name
        );

        for (let r = startRow; r <= endRow; r++) {
          for (
            let c = Math.min(startColumn, endColumn);
            c <= Math.max(startColumn, endColumn);
            c++
          ) {
            const rangeCellKey = `${r}-${this.dataGrid()[c].name}`;
            currentSelectedCells.add(rangeCellKey);
          }
        }
      }
    } else if (this.isCtrlPressed()) {
      // Ctrl + Click: Multi-select
      currentSelectedCells.has(cellKey)
        ? currentSelectedCells.delete(cellKey)
        : currentSelectedCells.add(cellKey);
    } else {
      // Normal Click: Select single cell
      currentSelectedCells.clear();
      currentSelectedCells.add(cellKey);
    }

    // Store last selected cell
    this.lastSelectedCell.set({ rowIndex, columnName: column.name });

    // Mark that the mouse is down on a valid cell
    this.isMouseDownOnCell.set(true);

    this.updateSelection(currentSelectedCells, rowData, column);
  }

  /**
   * Event triggers when cursor enters the cell area.
   * Used to drag select the cells when mouse is clicked.
   * @param rowIndex
   * @param columnName
   * @returns
   */
  onCellMouseEnter(rowIndex: number, columnName: string) {
    if (this.isMouseDownOnCell()) {
      const lastCell = this.lastSelectedCell();
      if (!lastCell) return;

      const startRow = Math.min(lastCell.rowIndex, rowIndex);
      const endRow = Math.max(lastCell.rowIndex, rowIndex);
      const startColumn = this.dataGrid().findIndex(
        (col: any) => col.name === lastCell.columnName
      );
      const endColumn = this.dataGrid().findIndex(
        (col: any) => col.name === columnName
      );

      let newSelectedCells = new Set<string>();

      // Select only the cells within the drag range
      for (let r = startRow; r <= endRow; r++) {
        for (
          let c = Math.min(startColumn, endColumn);
          c <= Math.max(startColumn, endColumn);
          c++
        ) {
          newSelectedCells.add(`${r}-${this.dataGrid()[c].name}`);
        }
      }

      // Update selected cells and emit changes
      this.selectedCells.set(newSelectedCells);
      this.selectedCellsChange.emit(newSelectedCells);
      this.selectedValuesChange.emit(this.selectedValues());
      this.isDragged.set(true);
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
  /**
   * Values of all cells in this.selectedCells()
   * Contains the value, dataType(for cell summary), row, column and memberList(for getting display value form the original key value)
   */
  selectedValues = computed(() => {
    return Array.from(this.selectedCells()).map((cellKey) => {
      const [rowIndex, field] = cellKey.split('-');
      const rowData = this._dataList()[+rowIndex];
      const columnData = this.dataGrid().find((col: any) => col.name === field);
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
   * executes when summary changes in CellSummaryComponent
   * @param summaryState
   */
  onSymmaryChanged(summaryState: {
    options: any[];
    isCellModeEnabled: boolean;
    computedValues: Record<string, string>;
  }) {
    this.isCellModeEnabled.set(summaryState.isCellModeEnabled);
    this.options.set(summaryState.options);
    this.computedValues.set(summaryState.computedValues);
    if (!summaryState) {
      this.clearSelection();
    }
  }

  // Clear all selected cells and emit empty selection
  private clearSelection() {
    this.selectedCells.set(new Set());
    this.selectedCellsChange.emit(new Set());
    this.selectedValuesChange.emit([]);
    this.lastSelectedCell.set(null);
  }

  // Update selection and emit related events
  private updateSelection(
    newSelection: Set<string>,
    rowData: any,
    column: any
  ) {
    this.selectedCells.set(newSelection);
    this.selectedCellsChange.emit(newSelection);
    this.selectedValuesChange.emit(this.selectedValues());
    this.cellClick.emit({ rowData, column, value: rowData[column.name] });
  }

  isLoadingStateChange(isLoadingState: boolean) {
    this.isLoading.emit(isLoadingState);
  }

  /**
   * To copy the selected cell values in tab-separated format
   * @returns
   */
  private copySelectedCellsToClipboard() {
    if (this.selectedCells().size === 0) return;

    // Format data as tab-separated values (for Excel-like pasting)
    const selectedValues = this.selectedValues();
    let clipboardData = '';

    // Group values by row (for multi-cell selection)
    const rows = new Map<number, any[]>();

    selectedValues.forEach((cell) => {
      const rowIndex = Number(cell.row); // Ensure correct row reference
      if (!rows.has(rowIndex)) {
        rows.set(rowIndex, []);
      }

      let cellValue = cell.value;

      // If the data type is '3', format it as yyyy/mm/dd
      if (cell.dataType === '3' && cellValue instanceof Date) {
        const year = cellValue.getFullYear();
        const month = String(cellValue.getMonth() + 1).padStart(2, '0');
        const day = String(cellValue.getDate()).padStart(2, '0');
        cellValue = `${year}/${month}/${day}`;
      }

      // If the data type is '4', match key from memberList
      if (cell.dataType === '4') {
        const matchedItem = cell.memberList.find(
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

      // clear multi-select selections in UI
      this.multiSelectValues = {};

      this.dataTable._filter(); // re-apply
    }
  }

  //This function is set the value of grid Filter Show or not
  toggleGridFilter() {
    this.gridFilterShow.set(!this.gridFilterShow());
  }

  toggleSelectAllPrint() {
    if (this._dataList() == null) {
      return;
    }
    this.selectAllPrint.set(!this.selectAllPrint());
    this._dataList().forEach((item: any) => {
      item.printChecked = this.selectAllPrint();
    });
  }

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

  isRowSelected(rowData: any): boolean {
    const key = this.selectedRowKey();
    if (key == null) return false;
    // if selected row key and current row key matches then its marked as selected
    return (
      key &&
      Object.keys(key).length > 0 &&
      JSON.stringify(rowData) === JSON.stringify(this.selectedRowData())
    );
  }

  // Grid sorting logic (matches Oracle sorting behavior)
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

  onGridFilter(event: TableFilterEvent) {
    this.tableFirst.set(0);
    if (this.dataTable) {
      this.dataTable.first = 0;
      if (this._dataList() == null) {
        return;
      }
      // Select first visible row after filter
      const firstRow = this._dataList()[0];
      if (firstRow) {
        this.selectedRowKey.set(this.getRowPkData(firstRow));
      }
    }
  }

  onGridSort(event: SortEvent) {
    this.tableFirst.set(0);
    if (this.dataTable) {
      this.dataTable.first = 0;
      if (this._dataList() == null) {
        return;
      }
      // Select first visible row after sort
      const firstRow = this._dataList()[0];
      if (firstRow) {
        this.selectedRowKey.set(this.getRowPkData(firstRow));
      }
    }
  }

  pageChange(event: TablePageEvent) {
    this.tableFirst.set(event.first);
    if (this._dataList() == null) {
      return;
    }
    const visibleData = this._dataList();
    const firstRow = visibleData[event.first];

    if (firstRow) {
      this.selectedRowKey.set(this.getRowPkData(firstRow));
    }
  }

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
      const fullData = this._dataList() ?? [];
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

  /**
   * function to open the toroku form
   * @param mode
   * @param targetType
   */
  navigateWithEncodedMode(
    mode: number,
    targetType: 'same' | 'tab' | 'window' = 'same'
  ) {
    const pkData = mode !== 1 ? JSON.stringify(this.selectedRowKey()) : null;
    const encoded = btoa(`mode=${mode}&pkData=${pkData}`);

    // save form state for modoru
    this.formStateService.torokuModoruFormId.set(this.formId());
    const formState = {
      isSearched: this._dataList() != null, // if _dataList() is null that means user havent presses searcha button yes so we wont search
      searchList: this.searchList(),
      selectedRowKey: this.selectedRowKey(),
      dtFirst: this.dataTable.first,
      dtSortField: this.dataTable.sortField,
      dtSortOrder: this.dataTable.sortOrder,
      dtFilter: this.dataTable.filters,
      dtRowsPerPage: this.dataTable.rows,
    };

    this.formStateService.setFormState(this.formId(), formState);

    const urlTree = this.router.createUrlTree(['/mitem0011u'], {
      queryParams: { key: encoded },
    });
    const baseHref = (
      document.getElementsByTagName('base')[0]?.href || window.location.origin
    ).replace(/\/$/, ''); // remove tailing backslash
    const fullUrl = baseHref + this.router.serializeUrl(urlTree);

    if (targetType === 'tab') {
      window.open(fullUrl, '_blank'); // Opens in a new tab
    } else if (targetType === 'window') {
      window.open(fullUrl, '_blank', 'width=1400,height=700'); // Opens in a new window with custom size
    } else {
      this.router.navigateByUrl(urlTree); // Same tab navigation
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
  /**
   * sets the rows per page for datatable
   * @param noOfRows
   */
  setRowsPerPage(noOfRows: number) {
    this.pageSizeDrpDown.set(noOfRows);
    this.rows.set(noOfRows);
    this.rowsChanged.emit(this.rows());
  }

  //pass hidefilterKBN to parent component
  hideFilterKBNChanged(filterkbn: any) {
    this.hideFilterKBNOut.emit(filterkbn);
  }
}
