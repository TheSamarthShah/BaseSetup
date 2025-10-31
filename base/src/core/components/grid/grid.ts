import {
  AfterViewInit,
  Component,
  ElementRef,
  computed,
  HostListener,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  QueryList,
  signal,
  SimpleChanges,
  ViewChild,
  ViewChildren,
  NgZone,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {
  MatCell,
  MatHeaderCell,
  MatTable,
  MatTableDataSource,
  MatTableModule,
} from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core'; // Needed for mat-option
import { MatIconModule } from '@angular/material/icon'; // Optional
import { MatButtonModule } from '@angular/material/button'; // Optional
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { SelectionModel } from '@angular/cdk/collections';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FILTER, MetadataKey } from '../../models/filter.type';
import {
  ColumnFilterState,
  detailViewConfig,
  FilterCondition,
  GRID,
} from '../../models/grid.type';
import { EXTRA_BTN } from 'src/core/models/extraButton.type';
import { SwapColumns } from 'src/core/models/swapcolumns.type';
import { GridServices } from 'src/core/services/grid-services';
import { GRID_TEXT } from '../../shared/jp-text';
import { Button } from '../button/button';
import { Multiselect, MultiselectOption } from '../multiselect/multiselect';
import { SelectOnFocus } from '../../directive/select-on-focus';
import { TabControl } from '../tabcontrol/tabcontrol';
import { Splitbutton } from '../splitbutton/splitbutton';
import { TextInput } from '../text-input/text-input';
import { NumberInput } from '../number-input/number-input';
import { Checkbox } from '../checkbox/checkbox';
import { SharedModule } from 'src/app/shared/shared.module';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { CellSummary } from '../cell-summary/cell-summary';
import { MaxLengthDirective } from '../../directive/max-length.directive';
import { SortData } from '../sort-data/sort-data';
import { Export } from '../export/export';
import { SwapColumn } from '../swap-column/swap-column';
import { SwapColumnServices } from 'src/core/services/swap-column-services';
import { MenuButton } from '../menuButton/menuButton';
import { ActyDatePipe } from '../../pipe/acty-date-pipe';
import { notify } from 'src/core/services/toast.service';
import { ToggleButton } from '../toggle-button/toggle-button';
import { catchError, firstValueFrom, of, take } from 'rxjs';
import { SaveData } from 'src/core/models/save-data.type';
import { DataChangeDetectedService } from 'src/core/services/data-change-detected-service';
import { DropDown } from '../dropdown/dropdown';
import { changesReturn } from 'src/core/models/confimChangesGuardsProps.type';
import { MessageDialogService } from 'src/core/services/message-dialog-service';
import { ReferenceScreenButton } from '../reference-screen-button/reference-screen-button';
import { refScreenColumns } from 'src/core/models/refScreenColumns.type';
import { ActyCommon } from 'src/core/services/acty-common';
import { LoaderService } from 'src/core/services/loader-service';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ColumnMetadataService } from 'src/core/services/column-metadata-service';
import { ColumnMetadata } from 'src/core/models/column-metadata.type';
@Component({
  selector: 'acty-grid',
  imports: [
    CommonModule,
    MatInputModule,
    MatTableModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatOptionModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatFormFieldModule,
    Button,
    Multiselect,
    SelectOnFocus,
    TabControl,
    Splitbutton,
    TextInput,
    NumberInput,
    Checkbox,
    SharedModule,
    TranslateModule,
    MatProgressSpinnerModule,
    CellSummary,
    MaxLengthDirective,
    SortData,
    Export,
    SwapColumn,
    MenuButton,
    ActyDatePipe,
    ToggleButton,
    DropDown,
    ReferenceScreenButton,
    MatTooltipModule,
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid implements OnInit, OnChanges, AfterViewInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) actyGridTable!: MatTable<any>;
  @ViewChild(MatTable, { read: ElementRef })
  actyGridTableElement!: ElementRef<HTMLTableElement>;
  @ViewChild('filterMenuTrigger') filterMenuTrigger!: MatMenuTrigger;
  @ViewChild('gridCaptionContainer', { static: false })
  gridCaptionContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('detailViewContainer', { static: false })
  detailViewContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('paginatorContainer', { static: false })
  paginatorContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('tableContainer', { static: false })
  tableContainer!: ElementRef<HTMLDivElement>;
  @ViewChild('actyGrid', { static: false })
  actyGrid!: ElementRef<HTMLDivElement>;
  @ViewChildren(MatHeaderCell, { read: ElementRef }) headerCells!: QueryList<
    ElementRef<HTMLTableCellElement>
  >;
  @ViewChildren(MatCell, { read: ElementRef }) bodyCells!: QueryList<
    ElementRef<HTMLTableCellElement>
  >;

  service = inject(GridServices);
  msgDialogService = inject(MessageDialogService);
  //for swap data
  swapColumnService = inject(SwapColumnServices);
  translate = inject(TranslateService);
  host = inject(ElementRef);
  ngZone = inject(NgZone);
  DataChangeDetected = inject(DataChangeDetectedService);
  ActyCommonService = inject(ActyCommon);
  loader = inject(LoaderService);
  metadataService = inject(ColumnMetadataService);

  dataGrid = input.required<GRID[]>();
  GridMenuBtns = input<EXTRA_BTN[]>([]);
  isCellSummary = input<boolean>(false); // PRoperty for a Cell selection
  lastSelectedCell: { rowIndex: number; columnName: string } | null = null;
  showExport = input<boolean>(false); // PRoperty for a Export
  exportURL = input<string>('');
  showSortData = input<boolean>(false); // Property for Sort Data
  visibleDataList = new MatTableDataSource<any>([]);
  getDataUrl = input.required<string>();
  saveDataUrl = input<string>('');
  searchList = input<Array<FILTER>>([]);
  additionalSearchData = input<any>(null);
  pageSizes = input<number[]>([25, 50, 75, 100]);
  editableGrid = input.required<boolean>();
  selectionMode = input<'single' | 'multiple'>('single');
  detailViewTab = input<detailViewConfig[]>([]);
  showSwapColumns = input<boolean>(false);
  userId = input.required<string>();
  formId = input.required<string>();
  formTitle = input.required<string>();
  gridActions = output<any>();
  isActionsVisible = input<boolean>(false);
  resizableCols = input<boolean>(false);
  showPaginator = input<boolean>(true);
  formLoaderKey = input.required<string>();
  refScreenDefaultValue = input<{ [key: string]: any }>({});
  extraButtonClick = output<any>();
  doubleClickedRow = output<any>();

  isCellModeEnabled = signal<boolean>(false);
  selectedCells = signal<Set<string>>(new Set());
  gridFilter = signal<ColumnFilterState[]>([]);
  //changes data when insert,update or delete in grid
  dataList = signal<any[]>([]);
  //the data can not be changes when changes in grid
  _dataList = signal<any[]>([]);
  _dataGrid = signal<GRID[]>([]);
  isBackgroundLoadingOn = signal<boolean>(false);
  gridOpsToggleState: 'active' | 'inactive' = 'inactive';

  refScreenOnRowData = signal<{
    refTableName: string;
    queryID: string;
    refColumns: refScreenColumns[];
    rowId: number;
    refForColumn: string;
    selectedValue: any;
    defaultValue: any;
  }>({
    refTableName: '',
    queryID: '',
    refColumns: [],
    rowId: -1,
    refForColumn: '',
    selectedValue: '',
    defaultValue: {},
  });
  copiedRows: any = [];
  //showColumnSwapdialog = signal<boolean>(false);

  showColumnSwapdialog: boolean = false;
  showSortDatadialog: boolean = false;
  showExportDatadialog: boolean = false;
  showGridOperationBtns: boolean = false;
  isCtrlPressed: boolean = false;
  isShiftPressed: boolean = false;
  isMouseDownOnCell: boolean = false;
  isDragged: boolean = false;
  resetDefaultSelectedRow: number | null = null;
  primaryKeyColumns: string[] = [];
  gridtext: any[] | undefined;
  // swapData - determined the order, visibility and frozen properties of grid
  swapData: SwapColumns[] = [];
  showDetailView: boolean = false;
  displayedColumns: string[] = [];
  editableMap: { [key: string]: boolean } = {};
  nextRowId: number = 1;
  selection!: SelectionModel<number>;
  textContent: any = GRID_TEXT;
  sortColumn: string = '';
  sortDirection: '' | 'asc' | 'desc' = '';
  saveList: SaveData = {
    Formid: '',
    Userid: '',
    Programnm: '',
    AddList: [],
    UpdateList: [],
    DeleteList: [],
  };
  invalidCellRowIds = signal<number[]>([]);
  selectedData: any[] = [];

  conditions_string: {
    value: FilterCondition;
    display: string;
  }[] = [
      {
        value: 'startsWith',
        display: 'CORE.GRID.FilterMatchConditions.StartsWith',
      },
      { value: 'contains', display: 'CORE.GRID.FilterMatchConditions.Contains' },
      {
        value: 'notContains',
        display: 'CORE.GRID.FilterMatchConditions.NotContains',
      },
      { value: 'endsWith', display: 'CORE.GRID.FilterMatchConditions.EndsWith' },
      { value: 'equals', display: 'CORE.GRID.FilterMatchConditions.Equals' },
      {
        value: 'notEquals',
        display: 'CORE.GRID.FilterMatchConditions.NotEquals',
      },
    ];
  conditions_number: {
    value: FilterCondition;
    display: string;
  }[] = [
      { value: 'equals', display: 'CORE.GRID.FilterMatchConditions.Equals' },
      {
        value: 'notEquals',
        display: 'CORE.GRID.FilterMatchConditions.NotEquals',
      },
      { value: 'lessThan', display: 'CORE.GRID.FilterMatchConditions.LessThan' },
      {
        value: 'greaterThan',
        display: 'CORE.GRID.FilterMatchConditions.GreaterThan',
      },
    ];
  conditions_date: {
    value: FilterCondition;
    display: string;
  }[] = [
      { value: 'dateIs', display: 'CORE.GRID.FilterMatchConditions.DateIs' },
      {
        value: 'dateIsNot',
        display: 'CORE.GRID.FilterMatchConditions.DateIsNot',
      },
      {
        value: 'dateIsBefore',
        display: 'CORE.GRID.FilterMatchConditions.DateBefore',
      },
      {
        value: 'dateIsAfter',
        display: 'CORE.GRID.FilterMatchConditions.DateAfter',
      },
    ];
  currentResizing: {
    column: string;
    startX: number;
    startWidth: number;
    headerEl: HTMLElement;
    bodyEls: HTMLElement[];
  } | null = null;

  private isWidthInitialized = false;

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

    // true if click is inside a table cell or header cell
    const insideCell = !!target.closest('.acty-grid-table td.grid-cell ');
    //  check if the click is inside the cell-summary area
    const insideCellSummary = !!target.closest(
      'acty-multiselect, acty-dialog-box'
    );

    // If clicking outside of a data cell, clear selection
    if (!this.isDragged && !insideCell && !insideCellSummary) {
      this.clearSelection();
    } else {
      this.isDragged = false;
      //call copy functionality when Ctrl + C is pressed
      this.copySelectedCellsToClipboard();
    }
  }

  ngOnInit() {
    this.selection = new SelectionModel<number>(
      this.selectionMode() !== 'single' ? true : false, // true = multi-select, false = single-select
      []
    );

    //for change grid heigth when row selected and show in detailview
    this.selection.changed.subscribe((change) => {
      //when any row added and removed in selection list then updatescrollheight can not be change
      //when any row added but not remove in selection list then updatescrollheight can be change
      //when any row removed but not added in selection list then updatescrollheight can be change
      if (
        change.added.length !== change.removed.length &&
        this.showDetailView
      ) {
        this.updateScrollHeight();
      }
    });
    if (this.showSwapColumns()) this.getSwapColumnData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['selectionMode']){
      this.selection = new SelectionModel<number>(
      this.selectionMode() !== 'single' ? true : false, // true = multi-select, false = single-select
      []
    );
    }
    if (changes['dataGrid']) {
      this._dataGrid.set(this.dataGrid());
      // Initialize filter states for each column
      this._dataGrid().forEach((column) => {
        let defaultCondition: FilterCondition;
        if (column.editorType === '1') {
          defaultCondition = this.conditions_string[0].value as FilterCondition;
        } else if (column.editorType === '2') {
          defaultCondition = this.conditions_number[0].value as FilterCondition;
        } else {
          defaultCondition = this.conditions_date[0].value as FilterCondition;
        }

        this.gridFilter.set([
          ...this.gridFilter(),
          {
            columnname: column.dataField,
            matchMode: 'all',
            rules: [{ condition: defaultCondition, value: '' }],
          },
        ]);

        //default set true for isSortable column in DataGrid
        if (column.IsSortable === undefined) {
          column['IsSortable'] = true;
        }

        //default set true for isfilterable column in grid
        if (column.IsFilterable === undefined) {
          column['IsFilterable'] = true;
        }

        //set default alignment for input (for number align right and other all left)
        if (
          column.alignment === undefined ||
          column.alignment === null ||
          column.alignment === ''
        ) {
          column['alignment'] = column.editorType === '2' ? 'right' : 'left';
        }
      });

      this.displayedColumns = this._dataGrid()
        .filter((col : GRID) => col.IsVisible && !col.isGridIgnore)
        .sort((a : GRID, b : GRID) => (a.displayOrder ?? 999) - (b.displayOrder ?? 999))
        .map((col : GRID) => col.dataField);

      if (this.editableGrid()) {
        this.editableMap = this._dataGrid().reduce((acc, col : GRID) => {
          acc[col.dataField] = col.isEditable ?? false;
          return acc;
        }, {} as { [key: string]: boolean });
      }
      this.primaryKeyColumns = this.dataGrid()
        .filter((col : GRID) => col.isPrimaryKey)
        .map((col : GRID) => col.dataField);
      this.getSwapColumnData();
      this.generateColumnMaxLengthWidth();
    }
  }

  ngAfterViewInit() {
    // Set up subscription to detect when view children are available
    this.headerCells.changes.subscribe(() => {
      if (this.headerCells.length > 0 && !this.isWidthInitialized) {
        this.initializeColumnWidths();
      }
    });

    this.updateScrollHeight();
  }

  // returns the name and display name for all columns(visible or not) for the grid
  gridColumnNameAndDisplayNameListAll(): any {
    return this._dataGrid()
      .filter(({ isGridIgnore }: GRID) => isGridIgnore !== true)
      .map(({ dataField, caption }: GRID) => ({
        dataField,
        displayName: this.getColumnDisplayName(dataField),
      }));
  }

  getColumnDisplayName(columnName: string): string {
    return (
      this._dataGrid().find((c :GRID ) => c.dataField === columnName)?.caption ??
      columnName
    );
  }

  getColumnConfig(columnName: string): GRID | undefined {
    return this._dataGrid().find((c : GRID) => c.dataField === columnName);
  }

  //get value of selected kbn in dropdown(mat-select)
  getKBNNmUsingKey(code: string, fieldKey: string): string | undefined {
    //get memberlist from datagrid which match with name of column
    const memberLists =
      this._dataGrid().find((col : GRID) => col.dataField === fieldKey)?.memberList ??
      [];
    //return name from memberlist which is match with code
    return memberLists.find((item: any) => item.code === code)?.caption;
  }

  //in which tab show column in tabcontrol
  isColumnInDetailViewTab(columnName: string, tabCaption: string): boolean {
    //get column all value from _dataGrid which is match with columnName
    const column = this._dataGrid().find((col : GRID) => col.dataField === columnName);
    if (column?.tabGroup === undefined) return false;
    //column tabGroup match with TabName,return ture or false
    return column.tabGroup.tabCaption === tabCaption;
  }

  //get column span size from for detailview
  getSizeofSpan(columnName: string) {
    const column = this._dataGrid().find((col : GRID) => col.dataField === columnName);
    //when column not define tabGroup then return null
    if (column?.tabGroup === undefined) return null;
    //return colspan of column(number)
    return column?.tabGroup.colSpan ?? 1;
  }

  // Get a Table Name For max-length directive
  getTableNameByColumn(column: string): string {
    const grid = this._dataGrid();
    const col = grid.find((c : GRID) => c.dataField === column);
    return col?.tableName ?? '';
  }

  isSelectedCell(rowIndex: number, columnName: string): boolean {
    // return this.selectedCells().has(`${rowIndex}-${columnName}`);
    const key = `${rowIndex}-${columnName}`;
    const result = this.selectedCells().has(`${rowIndex}-${columnName}`);

    return result;
  }
  // Clear all selected cells and emit empty selection
  private clearSelection(): void {
    this.selectedCells.set(new Set());
    this.lastSelectedCell = null;
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
    rowData: GRID,
    column: any,
    rowIndex: number,
    event: MouseEvent
  ): void {
    event.stopPropagation();
    if (!this.isCellModeEnabled()) {
      this.clearSelection();
      return;
    }

    const cellKey: string = `${rowIndex}-${column}`;
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
        const startColumn: number = this._dataGrid().findIndex(
          (col: GRID) => col.dataField === this.lastSelectedCell!.columnName
        );
        const endColumn: number = this._dataGrid().findIndex(
          (col: GRID) => col.dataField === column
        );

        for (let r: number = startRow; r <= endRow; r++) {
          for (
            let c: number = Math.min(startColumn, endColumn);
            c <= Math.max(startColumn, endColumn);
            c++
          ) {
            const rangeCellKey: string = `${r}-${this._dataGrid()[c].dataField
              }`;
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
      this.lastSelectedCell = { rowIndex, columnName: column };
    }

    // Mark that the mouse is down on a valid cell
    this.isMouseDownOnCell = true;

    this.updateSelection(currentSelectedCells, rowData, column);
  }

  // Update selection and emit related events
  private updateSelection(
    newSelection: Set<string>,
    rowData: GRID,
    column: GRID
  ): void {
    this.selectedCells.set(newSelection);
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
      const startColumn: number =
        this._dataGrid().find(
          (col: GRID) => col.dataField === lastCell.columnName
        )?.displayOrder ?? -1;
      const endColumn: number =
        this._dataGrid().find((col: GRID) => col.dataField === columnName)
          ?.displayOrder ?? -1;

      let newSelectedCells: Set<string> = new Set<string>();

      // Select only the cells within the drag range
      for (let r: number = startRow; r <= endRow; r++) {
        for (
          let c: number = Math.min(startColumn, endColumn);
          c <= Math.max(startColumn, endColumn);
          c++
        ) {
          newSelectedCells.add(
            `${r}-${this._dataGrid().find((col: GRID) => col.displayOrder === c)
              ?.dataField ?? ''
            }`
          );
        }
      }

      // Update selected cells and emit changes
      this.selectedCells.set(newSelectedCells);
      this.isDragged = true;
    }
  }

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

  onSortDataChange(): void {
    // set little timeout for loader as sort data component will emit a false value for loading
    setTimeout(() => {
      this.getData();
    }, 50);
  }

  // returns the name and display name for visible columns in the grid
  gridColumnNameAndDisplayNameList(): any {
    return this._dataGrid()
      .filter((item: GRID) => item.IsVisible)
      .map(({ dataField, caption, dateFormat }: GRID) => ({
        dataField,
        caption: this.translate.instant(caption),
        dateFormat: dateFormat ? dateFormat : 'yyyy/MM/dd',
      }));
  }

  //get list of tab name
  get DetailViewTabList() {
    return this.detailViewTab().map((item) => item.tabCaption);
  }

  //get align side of column input like left,right or center
  getItemAlign(columnNm: string) {
    const column = this._dataGrid().find((item : GRID) => item.dataField === columnNm);
    return column?.alignment;
  }

  //get column is sortable or not(return boolean)
  isSortable(columnNm: string) {
    const column = this._dataGrid().find((item : GRID) => item.dataField === columnNm);
    return column?.IsSortable !== undefined ? column.IsSortable : false;
  }

  //get column is filterable or not(return boolean)
  isFilterable(columnNm: string) {
    const column = this._dataGrid().find((item : GRID) => item.dataField === columnNm);
    return column?.IsFilterable !== undefined ? column.IsFilterable : false;
  }

  onEditChange(row: any, column: string, value: any) {
    row[column] = value;
    const config = this.getColumnConfig(column);
    config?.onChangeCallback?.(row);
  }

  //gird button is disable or not
  isButtonDisabled(nameOfBtn: any): boolean {
    //paste row button is disable whenever any row is not copy
    if (nameOfBtn.text === 'CORE.GRID.PasteRow') {
      if (this.selectedData.length !== 0) return false;
      else return true;
    }
    if (
      nameOfBtn.text === 'CORE.GRID.DeleteRow' ||
      nameOfBtn.text === 'CORE.GRID.CopyRow'
    ) {
      if (this.selectedRows.length !== 0) return false;
      else return true;
    } else if (
      nameOfBtn.text === 'CORE.GRID.Ref' ||
      nameOfBtn.text === 'CORE.GRID.EditData'
    ) {
      if (!this.selection.hasValue) return false;
      else return true;
    } else return false; //default disable false
  }

  //which button is click of gird
  buttonClicked(nameOfButton: string) {
    if (nameOfButton === 'CORE.GRID.DetailView') this.detailViewToggle();
    if (nameOfButton === 'CORE.GRID.AddRow') this.addNewRow();
    if (nameOfButton === 'CORE.GRID.DeleteRow') this.deleteRowData();
    if (nameOfButton === 'CORE.GRID.FilterReset') this.resetGridFilter();
    if (nameOfButton === 'CORE.GRID.SaveBtn') this.saveData();
    if (nameOfButton === 'CORE.GRID.CopyRow') this.copyRowData();
    if (nameOfButton === 'CORE.GRID.PasteRow') this.pasteRowData();
  }

  onClickToggleBtn(event: any, btnName: string) {
    if (btnName === 'CORE.GRID.GridFilterSort') {
      this.onGridOpsToggle(event);
    }
  }
  onGridOpsToggle(state: 'active' | 'inactive'): void {
    this.showGridOperationBtns = state === 'active';
    this.initializeColumnWidths();
  }

  //extra button click of gird
  extraButtonClicked(buttonName: string, menuId?: string) {
    this.extraButtonClick.emit({ name: buttonName, menuButtonId: menuId });
  }

  //get column is sticky or not
  getColumnisSticky(name: string): boolean {
    const temp = this._dataGrid().find((item : GRID) => item.dataField === name)?.isFrozen;
    if (temp === true) return true;
    return false; //default sticky column is false
  }

  //when click on Save Dialog
  async onSwapDataUpdate(newSwapData: Array<SwapColumns>): Promise<void> {
    this.swapData = newSwapData;
    await this.getSwapColumnData();
    this.showColumnSwapdialog = false;
    this.updateGridSwapData();
    this.actyGridTable.renderRows();
  }

  //when close the dialig
  closeSwapColumn(): void {
    this.showColumnSwapdialog = false;
  }

  closeSortData(): void {
    this.showSortDatadialog = false;
  }

  closeExportData(): void {
    this.showExportDatadialog = false;
  }

  openColumnSwapDialog() {
    this.showColumnSwapdialog = true;
  }

  openSortDataDialog() {
    this.showSortDatadialog = true;
  }

  openExportDataDialog() {
    this.showExportDatadialog = true;
  }

  /**
   * get the column swap data from db
   */
  async getSwapColumnData(): Promise<void> {
    this.swapData = await this.swapColumnService.getSwapDataOfForm(
      this.userId(),
      this.formId()
    );

    this._dataGrid().forEach((item) => {
      const match = this.swapData.find((s) => s.colnm === item.dataField);
      if (match) {
        item.displayOrder = match.dispcolno;
        item.isFrozen = Boolean(match.frozen);
        item.dataField = match.colnm;
        item.displayOrder = match.colno;
        item.IsVisible = Boolean(match.visible);
      }
    });
    this.updateGridSwapData();
  }

  /**
   * Applies this.swapData() to current grid
   * @returns
   */
  updateGridSwapData(): void {
    const _swapData: SwapColumns[] = this.swapData; // Get stored swap data
    if (!_swapData || _swapData.length === 0) {
      this._dataGrid.set(this.dataGrid());
      return;
    }

    // Update this.dataGrid based on swapData
    const updatedGrid = this.dataGrid().map((gridItem : GRID) => {
      const swapItem = _swapData.find(
        (swap) => swap.colnm === gridItem.dataField
      );

      return swapItem
        ? {
          ...gridItem,
          displayOrder: swapItem.dispcolno,
          isFrozen: swapItem.frozen === 1, // Convert number to boolean
          IsVisible: swapItem.visible === 1, // Convert number to boolean
        }
        : gridItem;
    });

    // Sort with frozen columns first (sorted by displaySeq), then others (sorted by displaySeq)
    updatedGrid.sort((a: GRID, b: GRID) => {
      // If one is frozen and the other isn't, frozen comes first
      if (a.isFrozen && !b.isFrozen) return -1;
      if (!a.isFrozen && b.isFrozen) return 1;

      // If both are frozen or both non-frozen, sort by displaySeq
      return (a.displayOrder ?? 0) - (b.displayOrder ?? 0);
    });
    this._dataGrid.set(updatedGrid);
    this.displayColumnList();
  }

  displayColumnList() {
    this.displayedColumns = [];
    this.displayedColumns = this._dataGrid()
      .filter((item: GRID) => item.IsVisible === true)
      .map((item: GRID) => item.dataField);
  }

  modifyDataList(): void {
    let rowid = 1;
    //assigning a unique rowid to every row and also changing data format of date columns
    const updatedList = this._dataList().map((item: any) => {
      const newitem = { ...item, rowid: rowid };
      rowid++;

      //converting date columns into date object
      this._dataGrid().forEach((column: GRID) => {
        if (column.editorType === '3') {
          newitem[column.dataField] = newitem[column.dataField]
            ? new Date(newitem[column.dataField])
            : '';
        }
      });
      return newitem;
    });
    this.nextRowId = rowid;
    this._dataList.set(structuredClone(updatedList));
    this.dataList.set(structuredClone(updatedList));
    this.visibleDataList = new MatTableDataSource<any>(
      structuredClone(this.applyFilter(updatedList))
    );

    this.sortData(this.sortColumn, false);
    this.selection.clear();  
    if (!this.selection.hasValue()) {
      //this.selection.select(this.visibleDataList.data[0]?.rowid);
    }
    this.createColumnWidthList();

    if (this.showPaginator()) {
      this.visibleDataList.paginator = this.paginator;
    }
  }

  async getData(afterSave: boolean = false): Promise<void> {
    if (!afterSave) {
      const result = await this.confirmChanges();

      if (result.proceed === false) {
        return;
      }
    }
    this.loader.increment(this.formLoaderKey());
    this._dataList.set([]);
    this.visibleDataList.data = [];
    // Clear a Cell When New Data Load
    this.selectedCells().clear();
    return new Promise((resolve, reject) => {
      this.service
        .getDataOfPage(
          this.searchList(),
          this.userId(),
          this.formId(),
          this.getDataUrl(),
          0,
          this.showPaginator() ? this.paginator.pageSize : null,
          this.additionalSearchData()
        )
        .subscribe({
          next: (res) => {
            let dataCount: number = 0;
            if (res.Messagecode === null && res.Message === null) {
              this._dataList.set(res.Data.Records);
              dataCount = this._dataList().length;
              this.modifyDataList();
              this.updateScrollHeight();
            } // TODO add proper message code
            else if (res.Messagecode === 'NODATAFOUND') {
              this._dataList.set([]);
              this.modifyDataList();
              notify('データが存在しません。', 'info');
            }
            this.loader.decrement(this.formLoaderKey())
            // no need to search for more data if first round gives less than page rows
            // this check is needed for reference selection without dialog opening and also it is efficient
            if (this.showPaginator() && dataCount >= this.paginator.pageSize) {
              //send request for remaining data
              this.fetchRemainingData(this.getDataUrl())
                .then(() => {
                  resolve();
                  this.resetDefaultSelectedRow = null;
                })
                .catch((err) => {
                  // always pass err object in reject as it does console.error
                  // which makes a toast from toast-error.service and http errors are skipped
                  reject(err);
                });
            } else {
              resolve();
              this.resetDefaultSelectedRow = null;
            }
          },
          error: (err) => {
            //set loading to false to hide the loader at the time of end of data fetch
            this.loader.decrement(this.formLoaderKey());
            // always pass err object in reject as it does console.error
            // which makes a toast from toast-error.service and http errors are skipped
            reject(err);
          },
        });
    });
  }

  fetchRemainingData(formGetUrl: string): Promise<void> {
    this.isBackgroundLoadingOn.set(true);
    return new Promise((resolve, reject) => {
      this.service
        .getDataOfPage(
          this.searchList(),
          this.userId(),
          this.formId(),
          formGetUrl,
          this.paginator.pageSize,
          null,
          this.additionalSearchData()
        )
        .subscribe({
          next: (res) => {
            if (res.Messagecode === null && res.Message === null) {
              const completeData = this.dataList().concat(res.Data.Records);
              this._dataList.set(completeData);
              this.modifyDataList();
            }
            this.isBackgroundLoadingOn.set(false);
            resolve();
          },
          error: (err) => {
            this.isBackgroundLoadingOn.set(false);
            // always pass err object in reject as it does console.error
            // which makes a toast from toast-error.service and http errors are skipped
            reject(err);
          },
        });
    });
  }

  updateScrollHeight(): void {
    //TODO ngZone
    setTimeout(() => {
      const parentDiv = this.host.nativeElement.parentElement as HTMLElement;
      const parentDivHeight = parentDiv?.clientHeight || 0;

      const paginationHeight =
        this.paginatorContainer?.nativeElement.clientHeight || 0;

      const captionHeight =
        this.gridCaptionContainer?.nativeElement.clientHeight || 0;
      const detailViewHeight =
        this.detailViewContainer?.nativeElement.clientHeight || 0;

      // Calculate available height dynamically
      const availableHeight =
        parentDivHeight - paginationHeight - captionHeight - detailViewHeight;

      const scrollHeight: string = `${availableHeight}px`;

      const tableContainer = this.tableContainer?.nativeElement;

      if (tableContainer) {
        if (availableHeight > 8) {
          tableContainer.style.display = '';
          tableContainer.style.height = scrollHeight;
          tableContainer.style.maxHeight = scrollHeight;
        } else {
          tableContainer.style.display = 'none';
        }
      }
    }, 200); // Small delay to ensure rendering is complete
  }

  get renderedColumns(): string[] {
    if (this.rowFormat()) {
      const columns = ['no', ...this.displayedColumns];
      // Check if the grid is editable and insert 'status'
      if (this.editableGrid()) {
        // Find the index of 'no' (which is 0) and insert 'status' at index 1.
        columns.splice(1, 0, 'status');
      }
      if (this.selectionMode() === 'multiple') {
        columns.unshift('select');
      }
      if (this.isActionsVisible()) {
        columns.push('actions');
      }
      return columns;
    } else {
      const columns = ['no', ...this.getDynamicColumnDefs()];
      // Check if the grid is editable and insert 'status'
      if (this.editableGrid()) {
        // Find the index of 'no' (which is 0) and insert 'status' at index 1.
        columns.splice(1, 0, 'status');
      }
      return columns;
    }
  }

  handleRowClick(event: any, row: any): void {
    this.createColumnWidthList();
    // Skip if click was on an inputable element (handled by stopPropagation)
    if (event.defaultPrevented) return;
    if (!this.selection.isSelected(row.rowid)) {
      this.selection.toggle(row.rowid);
    }
    this.actyGridTable.renderRows(); // Force update of checkboxes
  }

  //when row is selected
  onRowDoubleClick(row: any): void {
    this.doubleClickedRow.emit(row);
    // You can now perform actions with the double-clicked row data
  }

  //when click on detailview button then show detailview container
  detailViewToggle() {
    this.showDetailView = !this.showDetailView;
    this.updateScrollHeight();
  }

  onCheckboxChange(rowId: number, checked: boolean): void {
    if (checked) {
      this.selection.select(rowId);
    } else {
      this.selection.deselect(rowId);
    }
  }

  toggleAllRows(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
    } else {
      this.selection.select(
        ...this.visibleDataList.data.map((row) => row.rowid)
      );
    }
    this.actyGridTable.renderRows();
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.visibleDataList.data.length;
  }

  addNewRow(): void {
    const newRowData = this._dataGrid()
      //commented because needed to set hidden columns like updtdt from reference
      //there is code to set only columns in row data inside onReferenceScreenSelected
      //.filter((column: any) => column.visible === true)
      .reduce((acc: any, column: GRID) => {
        // Handle dropdowns
        if (column.memberList && column.memberList.length > 0) {
          acc[column.dataField] = column.memberList[0].code;
        }
        // Handle checkboxes
        else if (column.editorType === '5') {
          acc[column.dataField] = '0';//false; // Default checkbox to false (unchecked)
        }
        // All others default to null
        else {
          acc[column.dataField] = null;
        }
        return acc;
      }, {});
    newRowData._isNew = true;
    newRowData.rowid = this.nextRowId;
    this.nextRowId++;
    let insertIdx = 0;
    // append row in visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
    this.visibleDataList.data.splice(insertIdx, 0, structuredClone(newRowData));
    this.dataList().splice(insertIdx, 0, structuredClone(newRowData));
    this.DataChangeDetected.netRowChangeCounterIncrement();
    this.visibleDataList._updateChangeSubscription();
    this.actyGridTable.renderRows();
  }

  async deleteRowData(rowId?: number): Promise<void> {
    const rowsToDelete =
      rowId != null ? [rowId] : this.selectedRows.map((d) => d.rowid);

    if (!rowId || rowId === null) {
      const result = await this.msgDialogService.show({
        message: '選択したものを削除します。よろしいですか？',
        header: '確認',
        buttons: [
          {
            label: 'いいえ',
            severity: 'primary',
          },
          {
            label: 'はい',
            severity: 'primary',
          },
        ],
      });
      if (result === 0) return;
    }

    if (!rowsToDelete || rowsToDelete.length === 0) return;

    for (const rId of rowsToDelete) {
      const dataListIdx = this._dataList().findIndex(
        (d: any) => d.rowid === rId
      );
      const visibleDataListIdx = this.visibleDataList.data.findIndex(
        (d: any) => d.rowid === rId
      );
      const row = this.visibleDataList.data.find((d: any) => d.rowid === rId);

      // Handle the change counter based on whether the row was new
      if (row._isNew) {
        this.DataChangeDetected.netRowChangeCounterDecrement();
        this.visibleDataList.data.splice(visibleDataListIdx, 1);
      } else {
        this.DataChangeDetected.netRowChangeCounterIncrement();
      }

      if (dataListIdx !== -1) {
        this._dataList()[dataListIdx]._isDelete = true;
        row._isDelete = true;
      }
      // keep both if seperate for new row case
      if (visibleDataListIdx !== -1) {
        // remove from visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
        //this.visibleDataList.data.splice(visibleDataListIdx, 1);
        this.dataList().splice(visibleDataListIdx,1)
        this.visibleDataList._updateChangeSubscription();
      }
      this.selection.clear();
    }
  }

  //when any cells is updated
  onRowDataUpdate(rowData: any, columnName: string): void {
    if (rowData.invalidCells !== undefined) {
      rowData.invalidCells = rowData.invalidCells.filter((clm: any) => {
        if (clm.message === '重複データ') {
          // Remove all columns with DUPLICATE_PK_DATA message
          return clm.message !== '重複データ';
        } else {
          // remove only this column
          return clm.column !== columnName;
        }
      });
    }

    if (rowData._isNew) { 
      this.dataList.set(structuredClone(this.visibleDataList.data))
      return;
    }
    const rowId = rowData.rowid;
    const gridColumn = this._dataGrid().find(
      (col: GRID) => col.dataField === columnName
    );
    // datalist row
    const dataListRow = this._dataList().find((row: any) => row.rowid === rowId);
    // visible datalist row
    if(!dataListRow) return;
    const visibleDataListRow = rowData;
    const rawOldValue = dataListRow[columnName as keyof GRID];
    const rawNewValue = visibleDataListRow[columnName];
    if (!gridColumn) return;
    const oldValue =
      gridColumn.editorType === '3' &&
        rawOldValue !== null &&
        rawOldValue !== undefined
        ? this.ActyCommonService.getUtcIsoDate(rawOldValue)
        : rawOldValue;

    const newValue =
      gridColumn.editorType === '3' &&
        rawNewValue !== null &&
        rawNewValue !== undefined
        ? this.ActyCommonService.getUtcIsoDate(rawNewValue)
        : rawNewValue;

    if (!visibleDataListRow.changedCells) {
      visibleDataListRow.changedCells = [];
    }

    const oldStr = oldValue != null ? oldValue.toString() : '';
    const newStr = newValue != null ? newValue.toString() : '';

    if (oldStr !== newStr) {
      if (!visibleDataListRow.changedCells.includes(columnName)) {
        visibleDataListRow.changedCells.push(columnName);
        this.addInGlobalInDetection(rowId, columnName);
      }
      this.dataList.set(structuredClone(this.visibleDataList.data))
    } else {
      visibleDataListRow.changedCells = visibleDataListRow.changedCells.filter(
        (clm: string) => clm !== columnName
      );
      this.removeFromGlobalInDetection(rowId, columnName);
    }
  }

  addInGlobalInDetection(rowId: number, columnName: string): void {
    // ColumnName_RowId
    const identifier: string = columnName + '_' + rowId + '_';
    this.DataChangeDetected.dataChangeListPush(identifier);
  }

  removeFromGlobalInDetection(rowId: number, columnName: string): void {
    // ColumnName_RowId
    const identifier: string = columnName + '_' + rowId + '_';
    this.DataChangeDetected.dataChangeListRemove(identifier);
  }

  //when click  on grid save button
  async saveData(): Promise<boolean> {
    const saveData = this.getSaveData();
    if (
      (await saveData).validStatus === false ||
      ((await saveData).AddList.length === 0 &&
        (await saveData).UpdateList.length === 0 &&
        (await saveData).DeleteList.length === 0)
    ) {
      return false;
    }

    this.saveList.AddList = (await saveData).AddList;
    this.saveList.UpdateList = (await saveData).UpdateList;
    this.saveList.DeleteList = (await saveData).DeleteList;

    this.loader.increment(this.formLoaderKey());
    return new Promise((resolve) => {
      this.service.saveData(this.saveList, this.saveDataUrl()).subscribe({
        next: (res) => {
          this.loader.decrement(this.formLoaderKey());
          if (res.Message === null && res.Messagecode === null) {
            notify('更新が完了しました。', 'success');
            this.DataChangeDetected.netRowChangeCounterReset();
            resolve(true);
          } else {
            resolve(false);
          }
          this.getData(true);
        },
        error: (err) => {
          if (err.status === 409 && err.error.Message === 'COM0002') {
            // the data will contain invalid row's primary key data
            // Each table will be the key and as value there will be array of invalid rows
            const data = err.error.Data;
            const firstKey = Object.keys(data)[0]; // safely gets the first key
            const rows = data[firstKey] as Array<Record<string, any>>;
            const primaryKeyColumns = this._dataGrid().filter(
              (column: GRID) => column.isPrimaryKey && column.IsVisible
            );

            rows.forEach((duplicateRow) => {
              const matchingRows = this.visibleDataList.data.filter(
                (row: any) => {
                  return (
                    row._isNew === true &&
                    primaryKeyColumns.every((column: GRID) => {
                      const columnName = column.dataField;
                      const dataType = column.editorType;
                      if (dataType === '3') {
                        const visibleRowDate = new Date(row[columnName]);
                        const duplicateRowDate = new Date(
                          duplicateRow[columnName]
                        );
                        return (
                          this.ActyCommonService.getUtcIsoDate(
                            visibleRowDate
                          ) ===
                          this.ActyCommonService.getUtcIsoDate(duplicateRowDate)
                        );
                      } else {
                        return row[columnName] === duplicateRow[columnName];
                      }
                    })
                  );
                }
              );
              // Add errors
              matchingRows.forEach((row: any) => {
                const existingErrors = row.invalidCells ?? [];

                const newErrors: { column: string; message: string }[] = [];

                // Add primary key column errors
                primaryKeyColumns.forEach((column: GRID) => {
                  const key = column.dataField;
                  const alreadyMarked = existingErrors.some(
                    (e: { column: string; message: string }) =>
                      e.column === key && e.message === '重複データ'
                  );

                  if (!alreadyMarked) {
                    newErrors.push({ column: key, message: '重複データ' });
                  }
                });

                if (newErrors.length > 0) {
                  this.addInvalidCells(row, newErrors);
                }
              });
            });
          }
          this.loader.decrement(this.formLoaderKey());
          resolve(false);
        },
      });
      this.loader.decrement(this.formLoaderKey());
    });
  }

  /**
   * Method for validating single row
   * @param rowData
   * @returns a list of columns and a corresponding message
   */
  private async validateRowData(
    rowData: any
  ): Promise<{ column: string; message: string }[]> {
    const errors: { column: string; message: string }[] = [];

    for (const column of this._dataGrid()) {
      const value = rowData[column.dataField];

      // Required validation
      if (
        column.isRequired &&
        column.isAutoGenerate !== true &&
        (value === null || value === '' || value === undefined)
      ) {
        errors.push({ column: column.dataField, message: '必須入力です' });
        continue; // continue becuase already one error added for that column.
      }

      // check for negative inputs
      if (
        column.editorType === '2' &&
        column.isPositiveNumberOnly &&
        value < 0
      ) {
        errors.push({ column: column.dataField, message: 'マイナス入力不可' });
        continue;
      }
    }

    //check for duplicate data
    if (
      this.primaryKeyColumns.length > 0 &&
      //this._dataGrid().findIndex((c: GRID) => c.isAutoGenerate) === -1 &&
      rowData._isNew
    ) {
      const isDuplicate = this.dataList().some((existingRow) => {
        return this.primaryKeyColumns.every((key) => {
          const gridKey = key as keyof GRID;
          return existingRow[gridKey] === rowData[gridKey] && existingRow?.rowid !== rowData.rowid;
        });
      });

      if (isDuplicate) {
        for (const key of this.primaryKeyColumns) {
          errors.push({
            column: key,
            message: '重複データ',
          });
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
  addInvalidCells(
    row: any,
    columns: { column: string; message: string }[]
  ): void {
    if (row.invalidCells == undefined) {
      row.invalidCells = [];
    }
    columns.forEach((clm) => {
      row.invalidCells.push(clm);
    });
  }

  goToRow(rowId: number): void {
    const selectedRow = this.visibleDataList.data.find(
      (row: any) => row.rowid === rowId
    );
    if (selectedRow) {
      this.selectedData = [selectedRow]; // Wrap in array since it's now plural
    }
  }

  /**
   * Formats the data based on its data type
   * currently used for date and number
   * @param rowData
   * @returns
   */
  private formatRowData(rowData: any): any {
    const formattedData: any = {};
    this._dataGrid().forEach((column: GRID) => {
      if (column.isGridIgnore !== true) {
        const value = rowData[column.dataField];
        // Format based on dataType
        switch (column.editorType) {
          case '2': // Number
            formattedData[column.dataField] =
              value === '' || value === null ? null : Number(value);
            break;

          case '3': // Date
            if (value) {
              const date = new Date(value);
              // Reset time to 00:00:00
              date.setHours(0, 0, 0, 0);
              formattedData[column.dataField] =
                this.ActyCommonService.getUtcIsoDate(date);
            } else {
              formattedData[column.dataField] = null;
            }
            break;

          default: // String and other types
            formattedData[column.dataField] =
              value === '' || value === null ? null : value;
        }
      } else if (column.dataField?.startsWith('Updtdt')) {
        // for update date columns which is Updtdt
        const value = rowData[column.dataField];
        if (value) {
          const date = new Date(value);
          formattedData[column.dataField] =
            this.ActyCommonService.getUtcIsoDate(date, true);
        } else {
          formattedData[column.dataField] = null;
        }
      }
    });

    return formattedData;
  }

  isInvalidCell(row: any, column: string): boolean {
    return (
      row.invalidCells !== undefined &&
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

  async getSaveData(): Promise<{
    AddList: any;
    UpdateList: any;
    DeleteList: any;
    validStatus: boolean;
  }> {
    const addListPromises: Promise<any | null>[] = [];
    const updateListPromises: Promise<any | null>[] = [];
    const deleteList: any[] = [];
    let validStatus = true;

    const prepareRowWithValidation = async (row: any): Promise<any | null> => {
      const invalidColumns = await this.validateRowData(row);
      if (invalidColumns.length > 0) {
        validStatus = false;
        this.addInvalidCells(row, invalidColumns);
        this.invalidCellRowIds().push(row.rowid);
      }
      return this.formatRowData(row);
    };

    for (const row of this.visibleDataList.filteredData) {
      if (row._isNew) {
        addListPromises.push(prepareRowWithValidation(row));
      } else if (row.changedCells?.length > 0) {
        updateListPromises.push(prepareRowWithValidation(row));
      }
    }

    // Run validations before formatting deleteList
    const [addListRaw, updateListRaw] = await Promise.all([
      Promise.all(addListPromises),
      Promise.all(updateListPromises),
    ]);

    // Return early if validation failed
    if (!validStatus) {
      const firstInvalidCell = this.invalidCellRowIds()[0];

      // if (this.dataTable && this.dataTable.rows) {
      this.goToRow(firstInvalidCell);
      this.invalidCellRowIds.set([]);
      // }
      return {
        AddList: [],
        UpdateList: [],
        DeleteList: [],
        validStatus,
      };
    }

    for (const row of this._dataList()) {
      if (row._isDelete) {
        deleteList.push(await this.formatRowData(row));
      }
    }

    const AddList = addListRaw.filter(Boolean);
    const UpdateList = updateListRaw.filter(Boolean);

    return {
      AddList,
      UpdateList,
      DeleteList: deleteList,
      validStatus,
    };
  }

  get selectedRows(): any[] {
    if (!this.visibleDataList?.data || !this.selection) {
      return [];
    }

    return this.visibleDataList.data.filter((row) =>
      this.selection.selected.includes(row.rowid)
    );
  }

  sortData(column: string, toggle: boolean = true): void {
    if (toggle) {
      if (this.sortColumn !== column) {
        this.sortColumn = column;
        this.sortDirection = 'asc';
      } else {
        if (this.sortDirection === 'asc') {
          this.sortDirection = 'desc';
        } else if (this.sortDirection === 'desc') {
          this.sortDirection = 'asc';
        } else {
          this.sortColumn = '';
          this.sortDirection = '';
        }
      }
    }
    if (this.sortColumn) {
      this.visibleDataList.data.sort((a, b) => {
        const valueA = a[this.sortColumn];
        const valueB = b[this.sortColumn];

        if (valueA == null) return 1;
        if (valueB == null) return -1;

        if (typeof valueA === 'number' && typeof valueB === 'number') {
          return this.sortDirection === 'asc'
            ? valueA - valueB
            : valueB - valueA;
        }

        const strA = valueA.toString().toLowerCase();
        const strB = valueB.toString().toLowerCase();

        if (strA < strB) return this.sortDirection === 'asc' ? -1 : 1;
        if (strA > strB) return this.sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
      this.visibleDataList.data = structuredClone(this.applyFilter(this.dataList()));
    }
    //this.resetRowSelection();
    this.visibleDataList._updateChangeSubscription();
  }

  getSortIcon(col: string): string {
    if (this.sortColumn !== col) return 'import_export'; // default unsorted
    return this.sortDirection === 'asc' ? 'arrow_upward' : 'arrow_downward';
  }

  getColumnFilterState(col: string): ColumnFilterState {
    return (
      this.gridFilter().find((f) => f.columnname === col) ?? {
        columnname: col,
        matchMode: 'all',
        rules: [],
      }
    );
  }

  getColumnFilterRuleOptions(col: string): {
    value: string;
    display: string;
  }[] {
    let columnObj = this._dataGrid().find((c : GRID) => c.dataField === col);
    if (columnObj?.editorType === '2') return this.conditions_number;
    if (columnObj?.editorType === '3') return this.conditions_date;
    return this.conditions_string;
  }

  addRule(col: string): void {
    let columnFilterObj = this.getColumnFilterState(col);
    let columnObj = this._dataGrid().find((c : GRID) => c.dataField === col);
    let defaultCondition: FilterCondition;
    if (columnObj?.editorType === '1') {
      defaultCondition = this.conditions_string[0].value as FilterCondition;
    } else if (columnObj?.editorType === '2') {
      defaultCondition = this.conditions_number[0].value as FilterCondition;
    } else {
      defaultCondition = this.conditions_date[0].value as FilterCondition;
    }

    columnFilterObj.rules.push({ condition: defaultCondition, value: '' });
  }

  removeRule(col: string, index: number): void {
    let columnFilterObj = this.getColumnFilterState(col);
    columnFilterObj.rules.splice(index, 1);
  }

  applyFilterAndCloseMenu(trigger: MatMenuTrigger): void {
    this.applyFilter();
    // Now, call closeMenu() on the trigger that was passed in
    trigger.closeMenu();
  }

  clearFilterAndCloseMenu(col: string, trigger: MatMenuTrigger): void {
    this.clearFilter(col);
    // Now, call closeMenu() on the trigger that was passed in
    trigger.closeMenu();
  }

  resetGridFilter(): void {
    let newGridFilter: ColumnFilterState[] = [];
    this._dataGrid().forEach((column : GRID) => {
      let defaultCondition: FilterCondition;
      if (column.editorType === '1') {
        defaultCondition = this.conditions_string[0].value as FilterCondition;
      } else if (column.editorType === '2') {
        defaultCondition = this.conditions_number[0].value as FilterCondition;
      } else {
        defaultCondition = this.conditions_date[0].value as FilterCondition;
      }

      newGridFilter = [
        ...newGridFilter,
        {
          columnname: column.dataField,
          matchMode: 'all',
          rules: [{ condition: defaultCondition, value: '' }],
        },
      ];
    });
    this.gridFilter.set(newGridFilter);
    this.applyFilter();
  }

  // Add this method to your Grid component class
  applyFilter(list?: any): any[] {
    const sourceData = list || this.dataList();
    let filteredData = sourceData.filter((row: any) => {
      // Check if the row passes all column-level filters
      return this.gridFilter().every((filterState) => {
        // If a filter has no value, it passes automatically
        const hasValue = filterState.rules.some((rule) => rule.value !== '');
        if (!hasValue) {
          return true;
        }
        // Check if the row passes all rules for a single column (matchMode = 'all')
        if (filterState.matchMode === 'all') {
          const res = filterState.rules.every((rule) =>
            this.checkMatch(row, rule, filterState.columnname)
          );
          return res;
        }
        // Check if the row passes any rule for a single column (matchMode = 'any')
        else {
          const res = filterState.rules.some((rule) =>
            this.checkMatch(row, rule, filterState.columnname)
          );
          return res;
        }
      });
    });

    // Update the MatTableDataSource with the filtered data
    if (!list) {
      this.visibleDataList.data = structuredClone(filteredData);
      this.visibleDataList._updateChangeSubscription();
      this.actyGridTable.renderRows();
    }
    //this.resetRowSelection();
    return filteredData;
  }

  // Add this helper method to your Grid component class
  private checkMatch(
    row: any,
    rule: { condition: FilterCondition; value: any },
    columnName: string
  ): boolean {
    const cellValue = row[columnName];

    if (cellValue === null || cellValue === undefined) {
      return false;
    }
    const columnConfig = this.getColumnConfig(columnName);

    // Handle multiselect filter (special case)
    if (columnConfig?.editorType === '4') {
      const multiselectFilterValues = rule.value
        ? rule.value.split(',').map((s: string) => s.trim())
        : [];
      return multiselectFilterValues.includes(cellValue);
    }

    // Handle other data types based on the column's configuration
    if (columnConfig?.editorType === '1') {
      // String matching
      const cellValueStr = cellValue.toString().toLowerCase();
      const filterValueStr = rule.value.toString().toLowerCase();
      switch (rule.condition) {
        case 'startsWith':
          return cellValueStr.startsWith(filterValueStr);
        case 'contains':
          return cellValueStr.includes(filterValueStr);
        case 'notContains':
          return !cellValueStr.includes(filterValueStr);
        case 'endsWith':
          return cellValueStr.endsWith(filterValueStr);
        case 'equals':
          return cellValueStr === filterValueStr;
        case 'notEquals':
          return cellValueStr !== filterValueStr;
        default:
          return false;
      }
    } else if (columnConfig?.editorType === '2') {
      // Number matching
      const cellValueNum = parseFloat(cellValue);
      const filterValueNum = parseFloat(rule.value);
      if (isNaN(cellValueNum) || isNaN(filterValueNum)) return false;

      switch (rule.condition) {
        case 'equals':
          return cellValueNum === filterValueNum;
        case 'notEquals':
          return cellValueNum !== filterValueNum;
        case 'lessThan':
          return cellValueNum < filterValueNum;
        case 'greaterThan':
          return cellValueNum > filterValueNum;
        default:
          return false;
      }
    } else if (columnConfig?.editorType === '3') {
      // Date matching
      const cellDate = new Date(cellValue);
      const filterDate = new Date(rule.value);

      // Normalize dates to remove time for accurate comparison
      const normalizeDate = (d: Date) =>
        new Date(d.getFullYear(), d.getMonth(), d.getDate());
      const normalizedCellDate = normalizeDate(cellDate);
      const normalizedFilterDate = normalizeDate(filterDate);

      switch (rule.condition) {
        case 'dateIs':
          return (
            normalizedCellDate.getTime() === normalizedFilterDate.getTime()
          );
        case 'dateIsNot':
          return (
            normalizedCellDate.getTime() !== normalizedFilterDate.getTime()
          );
        case 'dateIsBefore':
          return normalizedCellDate < normalizedFilterDate;
        case 'dateIsAfter':
          return normalizedCellDate > normalizedFilterDate;
        default:
          return false;
      }
    }
    return false;
  }

  clearFilter(col: string): void {
    let columnFilterObj = this.getColumnFilterState(col);
    columnFilterObj.matchMode = 'all';
    let columnObj = this._dataGrid().find((c : GRID) => c.dataField === col);
    let defaultCondition: FilterCondition;
    if (columnObj?.editorType === '1') {
      defaultCondition = this.conditions_string[0].value as FilterCondition;
    } else if (columnObj?.editorType === '2') {
      defaultCondition = this.conditions_number[0].value as FilterCondition;
    } else {
      defaultCondition = this.conditions_date[0].value as FilterCondition;
    }

    columnFilterObj.rules = [{ condition: defaultCondition, value: '' }];

    this.applyFilter();
  }

  getGridFilterMultiselectoptions(col: string): MultiselectOption[] {
    let columnobj = this.getColumnConfig(col);
    let convertedList: MultiselectOption[] = [];
    if (columnobj && columnobj.memberList) {
      convertedList = columnobj.memberList.map((item) => ({
        key: item.code,
        label: item.caption,
      }));
    }
    return convertedList;
  }

  onGridActions(eventName: string, row: GRID) {
    this.gridActions.emit({ eventName: eventName, selectedRow: row });
  }

  /**
   * executes when summary changes in CellSummaryComponent
   * @param summaryState
   */
  onSummaryChanged(event: { isCellModeEnabled: boolean }) {
    this.isCellModeEnabled.set(event.isCellModeEnabled);
    if (this.isCellModeEnabled()) {
      //  this.selectedData = null;
    } else {
      this.selectedCells().clear();
    }
  }
  /**
   * Values of all cells in this.selectedCells()
   * Contains the value, dataType(for cell summary), row, column and memberList(for getting display value form the original key value)
   */
  selectedValues = computed((): any => {
    return Array.from(this.selectedCells()).map((cellKey) => {
      const [rowIndex, field] = cellKey.split('-');
      const rowData: any = this._dataList()[+rowIndex];

      const columnData: any = this._dataGrid().find(
        (col: GRID) => col.dataField === field
      );
      return {
        value: rowData ? rowData[field] : null,
        dataType: columnData ? columnData.editorType : '',
        row: rowIndex,
        column: field,
        memberList: columnData.memberList ?? null,
      };
    });
  });

  onColumnResizeStart(event: MouseEvent, column: string) {
    event.preventDefault();

    const headerEl = this.headerCells.find((h: any) =>
      h.nativeElement.classList.contains(`mat-column-${column}`)
    )?.nativeElement;

    if (!headerEl) return;

    const bodyEls = this.bodyCells
      .filter((c: any) =>
        c.nativeElement.classList.contains(`mat-column-${column}`)
      )
      .map((c: any) => c.nativeElement);

    this.currentResizing = {
      column,
      startX: event.pageX,
      startWidth: headerEl.offsetWidth,
      headerEl,
      bodyEls,
    };

    // Add event listeners with proper binding
    document.addEventListener('mousemove', this.onColumnResizing.bind(this));
    document.addEventListener('mouseup', this.onColumnResizeEnd.bind(this));
  }

  private onColumnResizing(event: MouseEvent) {
    if (!this.currentResizing) return;

    event.preventDefault();
    const delta = event.pageX - this.currentResizing.startX;
    const newWidth = Math.max(0, this.currentResizing.startWidth + delta); // Change 50 to 0

    // Apply new width only to the resized column
    //this.currentResizing.headerEl.style.width = newWidth + 'px';
    this.currentResizing.headerEl.style.minWidth = newWidth + 'px';
    this.currentResizing.headerEl.style.maxWidth = newWidth + 'px';

    this.currentResizing.bodyEls.forEach((cell) => {
      //cell.style.width = newWidth + 'px';
      cell.style.minWidth = newWidth + 'px';
      cell.style.maxWidth = newWidth + 'px';
      // Ensure content is hidden with ellipsis when resized down
      cell.style.overflow = 'hidden';
      cell.style.textOverflow = 'ellipsis';
      cell.style.whiteSpace = 'nowrap';
    });
  }

  private onColumnResizeEnd() {
    document.removeEventListener('mousemove', this.onColumnResizing.bind(this));
    document.removeEventListener('mouseup', this.onColumnResizeEnd.bind(this));
    this.currentResizing = null;
  }

  initializeColumnWidths() {
    if (this.headerCells.length === 0) return;

    setTimeout(() => {
      // Reset both header and body cell width properties first
      this.resetHeaderCellWidths();
      this.resetBodyCellWidths();

      const columnWidths = new Map<string, number>();

      // Capture natural widths from header cells
      this.headerCells.forEach((headerCellRef) => {
        const headerCell = headerCellRef.nativeElement;
        const columnClass = Array.from(headerCell.classList).find((cls) =>
          cls.startsWith('mat-column-')
        );

        if (columnClass) {
          const columnName = columnClass.replace('mat-column-', '');
          columnWidths.set(columnName, headerCell.offsetWidth);
        }
      });
      // Apply widths to all cells
      this.applyColumnWidths(columnWidths);

      this.isWidthInitialized = true;
    });
  }

  private resetHeaderCellWidths() {
    // Reset all header cells to auto width for accurate measurement
    this.headerCells.forEach((headerCellRef) => {
      const headerCell = headerCellRef.nativeElement;
      headerCell.style.width = '';
      headerCell.style.minWidth = '';
      headerCell.style.visibility = '';
      headerCell.style.overflow = '';
      headerCell.style.textOverflow = '';
      headerCell.style.whiteSpace = '';
    });
  }

  private resetBodyCellWidths() {
    // Reset all body cells to auto width for accurate measurement
    this.bodyCells.forEach((bodyCellRef) => {
      const bodyCell = bodyCellRef.nativeElement;
      bodyCell.style.width = '';
      bodyCell.style.minWidth = '';
      bodyCell.style.visibility = '';
      bodyCell.style.overflow = '';
      bodyCell.style.textOverflow = '';
      bodyCell.style.whiteSpace = '';
    });
  }

  private applyColumnWidths(columnWidths: Map<string, number>) {
    // Apply to header cells
    this.headerCells.forEach((headerCellRef) => {
      const headerCell = headerCellRef.nativeElement;
      const columnClass = Array.from(headerCell.classList).find((cls) =>
        cls.startsWith('mat-column-')
      );

      if (columnClass) {
        const columnName = columnClass.replace('mat-column-', '');
        const width = columnWidths.get(columnName);
        if (width !== undefined) {
          headerCell.style.width = `${width}px`;
          headerCell.style.minWidth = `${width}px`;
          // Hide content completely at 0 width
          if (width === 0) {
            headerCell.style.visibility = 'hidden';
          } else {
            headerCell.style.visibility = 'visible';
            headerCell.style.overflow = 'hidden';
            headerCell.style.textOverflow = 'ellipsis';
            headerCell.style.whiteSpace = 'nowrap';
          }
        }
      }
    });

    // Apply to body cells
    this.bodyCells.forEach((bodyCellRef) => {
      const bodyCell = bodyCellRef.nativeElement;
      const columnClass = Array.from(bodyCell.classList).find((cls) =>
        cls.startsWith('mat-column-')
      );

      if (columnClass) {
        const columnName = columnClass.replace('mat-column-', '');
        const width = columnWidths.get(columnName);
        if (width !== undefined) {
          bodyCell.style.width = `${width}px`;
          bodyCell.style.minWidth = `${width}px`;
          // Hide content completely at 0 width
          if (width === 0) {
            bodyCell.style.visibility = 'hidden';
          } else {
            bodyCell.style.visibility = 'visible';
            bodyCell.style.overflow = 'hidden';
            bodyCell.style.textOverflow = 'ellipsis';
            bodyCell.style.whiteSpace = 'nowrap';
          }
        }
      }
    });

    // Apply table-layout: fixed to the table
    const tableElement = document.querySelector(
      '.acty-grid-table'
    ) as HTMLElement;
    if (tableElement) {
      tableElement.style.tableLayout = 'fixed';
    }
  }

  getTHStyleForTD(column: string): { [key: string]: string } {
    const headerEl = this.headerCells.find((h) =>
      h.nativeElement.classList.contains(`mat-column-${column}`)
    )?.nativeElement as HTMLElement | undefined;

    if (!headerEl) return {};

    const computed = getComputedStyle(headerEl);

    return {
      width: computed.width,
      minWidth: computed.minWidth,
      maxWidth: computed.maxWidth,
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    };
  }

  onPageChange(e: any): void {
    this.resetRowSelection();
  }

  getColumnDateFormat(clm: string): string | undefined {
    const columnData = this._dataGrid().find((c : GRID) => c.dataField === clm);

    if (!columnData) return undefined;

    const dateFormat = columnData.dateFormat;

    if (!dateFormat) return undefined;

    return dateFormat;
  }

  resetRowSelection(): void {
    if (this.selectionMode() === 'single') {
      const paginator = this.paginator;
      const index = paginator ? paginator.pageIndex * paginator.pageSize : 0;

      if (!this.visibleDataList?.data?.length) {
        return;
      }
      if (this.resetDefaultSelectedRow) {
        this.selection.select(this.resetDefaultSelectedRow);
        return;
      }

      // Validate index is within range
      if (index < 0 || index >= this.visibleDataList.data.length) {
        return;
      }

      const row = this.visibleDataList.data[index];

      if (row?.rowid == null) {
        return;
      }

      if (!this.selection.isSelected(Number(row.rowid))) {
        this.selection.toggle(Number(row.rowid));
      }
      this.tableContainer.nativeElement.scrollTop = 0;
    } else {
    }
  }

  onDetailViewTabChange(e: any): void {
    this.updateScrollHeight();
  }

  get MenuItems(): any[] {
    const menu: any[] = [];
    if (this.showExport()) {
      menu.push({
        key: 1,
        label: this.translate.instant('CORE.GRID.TABLEOPTIONS.ExportData'),
        icon: 'save_alt',
      });
    }
    if (this.showSwapColumns()) {
      menu.push({
        key: 2,
        label: this.translate.instant('CORE.GRID.TABLEOPTIONS.SwapColumns'),
        icon: 'autorenew',
      });
    }
    if (this.showSortData()) {
      menu.push({
        key: 3,
        label: this.translate.instant('CORE.GRID.TABLEOPTIONS.SortData'),
        icon: 'swap_vert',
      });
    }
    return menu;
  }

  get showTableOptions(): boolean {
    return this.showExport() || this.showSwapColumns() || this.showSortData();
  }

  onClickMenuButtons(event: any, btnName: string) {
    if (btnName === 'CORE.GRID.TableOptionsLbl') {
      this.onTableOptionsClick(event);
    }
  }

  onTableOptionsClick(item: any): void {
    switch (item.id) {
      case '1':
        this.openExportDataDialog();
        break;
      case '2':
        this.openColumnSwapDialog();
        break;
      case '3':
        this.openSortDataDialog();
        break;
    }
  }

  get hasGridCaption(): boolean {
    return (
      this.GridMenuBtns()?.length > 0 ||
      (this.isCellSummary() && !this.editableGrid()) ||
      this.showTableOptions
    );
  }
  get GridState(): { [key: string]: any } {
    return {
      isSearched: this._dataList() != null,
      selectedRowId: this.selection.selected[0],
      dtSortField: this.sortColumn,
      dtSortOrder:
        this.sortDirection === 'asc'
          ? 1
          : this.sortDirection === 'desc'
            ? -1
            : undefined,
      dtFilter: this.gridFilter(),
      dtRowsPerPage: this.paginator?.pageSize,
      gridOpsToggleState: this.gridOpsToggleState,
    };
  }
  async setGridState(value: { [key: string]: any }) {
    if (!value) return;
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));
    // Apply the values to component properties
    if (value['selectedRowId'] !== undefined) {
      this.resetDefaultSelectedRow = value['selectedRowId'];
    }
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));
    if (
      value['dtRowsPerPage'] !== undefined &&
      value['dtRowsPerPage'] !== null &&
      this.paginator
    ) {
      this.paginator.pageSize = value['dtRowsPerPage'];
    }
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));
    if (value['dtSortField'] !== undefined && value['dtSortField'] !== '') {
      this.sortColumn = value['dtSortField'];

      if (value['dtSortOrder'] === 1) {
        this.sortDirection = 'asc';
      } else if (value['dtSortOrder'] === -1) {
        this.sortDirection = 'desc';
      } else {
        this.sortDirection = '';
      }
    }
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));
    if (value['gridOpsToggleState'] !== undefined) {
      this.gridOpsToggleState = value['gridOpsToggleState'];
      this.onGridOpsToggle(this.gridOpsToggleState);
    }
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));

    if (value['dtFilter'] !== undefined) {
      this.gridFilter.set([]);
      this.gridFilter.set(value['dtFilter']);
    }
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));
  }

  copyRowData(): void {
    this.selectedData = this.selectedRows.map((row) => ({ ...row }));
    if (!this.selectedData || this.selectedData.length === 0) {
      return;
    }
    //set null which column is auto increment
    this.selectedData.forEach((row) => {
      this._dataGrid().forEach((col : GRID) => {
        if (col.isAutoGenerate && col.dataField in row) {
          row[col.dataField] = null;
        }
      });
    });

    const copyData: GRID[] = [];
    const autoGenColumns = this._dataGrid()
      .filter((col: GRID) => col.isAutoGenerate)
      .map((col: GRID) => col.dataField);

    this.selectedData.forEach((row: any) => {
      const newRow = { ...row }; // shallow clone

      // Reset autogenerate columns
      autoGenColumns.forEach((colName: string) => {
        newRow[colName] = null;
      });

      // Assign new row ID
      newRow.rowid = this.nextRowId++;
      newRow._isNew = true;

      copyData.push(newRow);
    });
    this.copiedRows = copyData;
  }

  pasteRowData(): void {
    const copiedRowsData = structuredClone(this.copiedRows)
    let maxRowId = Math.max(...this.visibleDataList.data.map((item: any) => item.rowid));
    copiedRowsData.forEach((item: any) => {
      maxRowId += 1;
      item.rowid = maxRowId;
  });

    if (this.selectedData && this.selectedData.length === 1) {
      const selectedRowId = this.selectedData[0].rowid;
      const selectedIndex = this.visibleDataList.data.findIndex(
        (r) => r.rowid === selectedRowId
      );
      if (selectedIndex !== -1) {
        this.visibleDataList.data.splice(
          selectedIndex + 1,
          0,
          ...copiedRowsData
        );
      } else {
        this.visibleDataList.data.unshift(...copiedRowsData);
      }
    } else {
      this.visibleDataList.data.unshift(...copiedRowsData);
    }
    copiedRowsData.forEach((row: any) => {
      this.DataChangeDetected.netRowChangeCounterIncrement();
    });
    this.goToRow(copiedRowsData[0].rowid);
    this.visibleDataList.data = [...this.visibleDataList.data];
    this.dataList.set(structuredClone(this.visibleDataList.data));
    this.actyGridTable.renderRows();
  }

  hasGridChanges(): any {
    const hasNewOrChanged = this.visibleDataList.data.some(
      (row: any) => row._isNew === true || row.changedCells?.length > 0
    );

    // check deleted from _dataList because those rows are removed from visibleDataList
    const hasDeleted = this._dataList().some(
      (row: any) => row._isDelete === true
    );

    return hasNewOrChanged || hasDeleted;
  }
  //change detect check
  async confirmChanges(): Promise<changesReturn> {
    const isGridChanged = this.hasGridChanges();
    if (!isGridChanged) {
      return { proceed: true, hasChanges: false }; // No changes, proceed without confirmation
    }

    const result = await this.msgDialogService.show({
      message: 'データが変更されています。 保存しますか??',
      header: '確認',
      buttons: [
        {
          label: 'キャンセル',
          severity: 'primary',
        },
        {
          label: 'いいえ',
          severity: 'primary',
        },
        {
          label: 'はい',
          severity: 'primary',
        },
      ],
    });
    if (result === 2) {
      this.DataChangeDetected.dataChangeListReset();
      this.DataChangeDetected.netRowChangeCounterReset();
      // YES pressed
      await this.saveData(); //update data
      return { proceed: true, hasChanges: true }; // Proceed with save if success
    } else if (result === 1) {
      this.DataChangeDetected.dataChangeListReset();
      this.DataChangeDetected.netRowChangeCounterReset();
      // NO pressed
      return { proceed: true, hasChanges: true }; // Proceed without saving
    }
    // Default return to handle unexpected cases
    return { proceed: false, hasChanges: false };
  }

  //Check References Screen or not
  isReferenceScreenAvailable(column: string): boolean {
    return this.editableGrid() &&
      this._dataGrid().find(
        (item: GRID) =>
          item?.isReferenceScreen === true && item?.dataField === column
      )
      ? true
      : false;
  }

  //return references Columns list for references Dialog
  getReferencesColumns(column: string) {
    return this._dataGrid().find(
      (item: GRID) =>
        item?.isReferenceScreen === true && item?.dataField === column
    )?.refColumns;
  }

  getReferencesTableName(column: string): string {
    return (
      this._dataGrid().find(
        (item: GRID) =>
          item?.isReferenceScreen === true && item?.dataField === column
      )?.refTableName ?? ''
    );
  }

  getReferenceTitleCaption(column: string): string {
    return this._dataGrid().find(
      (item: GRID) =>
        item?.isReferenceScreen === true && item.dataField === column
    )?.caption ?? '';
  }

  getQueryIdForReferenceScreen(column: string): string {
    return this._dataGrid().find(
      (item: GRID) =>
        item?.isReferenceScreen === true && item.dataField === column
    )?.queryID ?? '';
  }

  isPrimaryKeyColumn(colNm: string) {
    return this._dataGrid().find((item: GRID) => (item?.isPrimaryKey === true && item?.dataField === colNm)) ? true : false
  }

  isAutoGenerateColumn(colNm: string) {
    return this._dataGrid().find((item: GRID) => (item?.isAutoGenerate === true && item?.dataField === colNm)) ? true : false
  }

  // when data is selected from reference screen this function will be ececuted to set that data
  async onReferenceDataSelected(event: {
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
    rowId: number;
  }): Promise<void> {
    const rowId = event.rowId;
    if (rowId === -1) {
      return;
    }
    let rowData = this.visibleDataList.data.find(
      (row: any) => row.rowid === rowId
    );

    for (const { key, value } of event.mainScreenColumnValues) {
      // Convert first character to uppercase
      const capitalizedKey = key.charAt(0).toUpperCase() + key.slice(1);

      // Check with capitalized version
      if (capitalizedKey in rowData) {
        (rowData as Record<string, any | null>)[capitalizedKey] = value;
      }
    }

    const column = this._dataGrid().find(
      (col: GRID) => col.dataField === event.refForColumn
    );

    this.onRowDataUpdate(rowData, event.refForColumn);

    // execute the callback function
    if (column?.onChangeCallback) {
      column.onChangeCallback(rowData);
    }

    // Clear ref screen data
    this.refScreenOnRowData.set({
      refTableName: '',
      queryID: '',
      refColumns: [],
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
    //const hasReferenceScreen = !column.isPrimaryKey && column.isReferenceScreen;
    const hasReferenceScreen = this._dataGrid().find(
      (item: GRID) =>
        item?.isReferenceScreen === true && item?.dataField === column
    )
      ? true
      : false;
    // if it has reference screen then get its ref data by setting this.refScreenOnRowData
    if (hasReferenceScreen) {
      this.setRefScreenRowData(rowData, column);
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
    const gridColumn = this._dataGrid().find(
      (col: GRID) => col.dataField == column
    );
    if (
      gridColumn &&
      rowData[gridColumn.dataField] !== null &&
      rowData[gridColumn.dataField] !== ''
    ) {
      /**
       * refScreenOnRowData is given as input in reference button which searches for data
       * based on refScreenOnRowData set here.
       */
      this.refScreenOnRowData.set({
        refTableName: gridColumn.refTableName ?? '',
        queryID: gridColumn.queryID ?? '',
        refColumns: gridColumn.refColumns ?? [],
        rowId: rowData.rowid,
        refForColumn: gridColumn.dataField,
        selectedValue: rowData[gridColumn.dataField],
        defaultValue: this.refScreenDefaultValue(),
      });
    } else if (gridColumn) {
      gridColumn.refColumns?.forEach((refCol: refScreenColumns) => {
        if (refCol.mainScreenColumnName) {
          rowData[refCol.mainScreenColumnName.replace(/\b\w/g, char => char.toUpperCase())] = null;
        }
      });
    }
  }

  isEditableColumn(column: string): boolean {
    const gridColumn = this._dataGrid().find(
      (col: GRID) => col.dataField === column
    );
    return (gridColumn && gridColumn.isEditable) ? gridColumn.isEditable : false;
  }

  isRequiredColumn(column: string): boolean {
    const gridColumn = this._dataGrid().find(
      (col: GRID) => col.dataField === column
    );
    return (gridColumn && gridColumn.isRequired) ? gridColumn.isRequired : false;
  }

  /**
   * Generates a comprehensive professional tooltip with all column metadata
   * Each property is displayed on a separate line for clear readability
   */
  getColumnTooltip(column: string): string {
    const gridColumn = this._dataGrid().find(
      (col: GRID) => col.dataField === column
    );

    if (!gridColumn) {
      return column;
    }

    const tooltipLines: string[] = [];

    if (gridColumn.isEditable) {
      tooltipLines.push('入力項目: はい');
    } else {
      tooltipLines.push('入力項目: エアー');
    }

    if (gridColumn.isRequired) {
      tooltipLines.push('必須入力項目');
    }

    return tooltipLines.join('\n');
  }

  getRowStatusTooltip(row: any): string {
    const requiredColumns: string[] = [];

    // Find all required columns from _dataGrid
    this._dataGrid().forEach((col: GRID) => {
      if (col.isEditable && col.isRequired && row._isNew) {
        const columnName = this.translate.instant(col.caption);
        requiredColumns.push(`${columnName} : 必須入力項目`);
      }
    });

    if (requiredColumns.length === 0) {
      return '';
    }

    // Join with newline character
    return requiredColumns.join('\n');
  }

  getRowStatusClass(row: any): string {
    let className: string = '';
    if (this.hasRowError(row)) {
      return ' errorRowStatus';
    }
    if (row._isNew) {
      return ' newRowStatus';
    }
    if (row._isDelete) {
      return ' deleteRowStatus';
    }
    if (row.changedCells?.length > 0) {
      return ' updateRowStatus';
    }
    return className;
  }

  getRowStatusChar(row: any): string {
    let className: string = '\u2007';
    if (row._isNew) {
      return 'A';
    }
    if (row._isDelete) {
      return 'D';
    }
    if (row.changedCells?.length > 0) {
      return 'U';
    }
    return className;
  }

  isCellUpdated(column: string, row: any): boolean {
    if (row.changedCells?.length > 0 && row.changedCells.includes(column)) {
      return true;
    }
    return false;
  }

  hasRowError(row: any): boolean {
    if (row._isNew) {
      return true;
    }
    return false;
  }

  hasColumnError(column: string, row: any): boolean {
    const gridColumn = this._dataGrid().find(
      (col: GRID) => col.dataField === column
    );
    if (gridColumn?.isEditable && gridColumn?.isRequired && row._isNew) {
      return true;
    }
    return false;
  }

  private createColumnWidthList(): void {
    this.columnWidthsForInput = {};
    const table = this.tableContainer?.nativeElement;
    if (!table) return;

    this.displayedColumns.forEach((column) => {
      const cell = table.querySelector(
        `.mat-column-${column}`
      ) as HTMLElement | null;

      if (cell) {
        const computedStyle = getComputedStyle(cell);
        const border =
          parseFloat(computedStyle.borderLeftWidth) +
          parseFloat(computedStyle.borderRightWidth);

        const contentWidth = cell.offsetWidth - border;

        this.columnWidthsForInput[column] = `${contentWidth}px`;
      } else {
        this.columnWidthsForInput[column] = 'auto';
      }
    });
  }

  getColumnWidth(columnName: string): string {
    return this.columnWidthsForInput[columnName] || 'auto';
  }

  private columnWidthsForInput: Record<string, string> = {};
  rowFormat = input<boolean>(true);

  // Get all rows for a given ColumnGroup
  getRowsForGroup(groupNo: number): number[] {
    const rows = this._dataGrid()
      .filter((c) => Number(c.ColumnGroupNumber) === groupNo && !c.isGridIgnore)
      .map((c) => Number(c.rowIndex));
    return Array.from(new Set(rows)).sort((a, b) => a - b);
  } //

  // Get columns for a given row AND column group
  getFieldsForRow(rowNo: number, groupNo: number): any[] {
    return this._dataGrid().filter(
      (c) =>
        Number(c.rowIndex) === rowNo &&
        Number(c.ColumnGroupNumber) === groupNo &&
        !c.isGridIgnore
    );
  } //

  getColumnGroups(): number[] {
    const dataGrid = this._dataGrid();

    if (!dataGrid || !Array.isArray(dataGrid)) {
      return [1]; // Return default group if no data
    }

    // Get unique ColumnGroupNumber values from visible columns
    const uniqueGroups = new Set<number>();

    dataGrid.forEach((column) => {
      // Only consider visible columns that have ColumnGroupNumber
      if (column.IsVisible !== false && column.ColumnGroupNumber) {
        const groupNumber = parseInt(column.ColumnGroupNumber, 10);
        if (!isNaN(groupNumber)) {
          uniqueGroups.add(groupNumber);
        }
      }
    });

    // Convert Set to array and sort
    const groups = Array.from(uniqueGroups).sort((a, b) => a - b);

    // Return sorted groups, or default to [1] if no groups found
    return groups.length > 0 ? groups : [1];
  }

  getDynamicColumnDefs(): string[] {
    return this.getColumnGroups().map((groupNo) => `group_${groupNo}`);
  }

  private columnMaxLengthWidths: { [key: string]: string } = {};

  generateColumnMaxLengthWidth(): void {
    const dataGrid = this._dataGrid();

    if (!dataGrid || !Array.isArray(dataGrid)) {
      return;
    }

    this.metadataService
      .getColumnMetadata()
      .pipe(
        take(1),
        catchError(() => of([] as ColumnMetadata[]))
      )
      .subscribe((metadata: ColumnMetadata[]) => {
        this.columnMaxLengthWidths = {}; // Reset widths

        // Set width for 'no' column
        this.columnMaxLengthWidths['no'] = '80px';

        // Calculate widths for data columns
        dataGrid.forEach((column) => {
          if (
            column.IsVisible !== false &&
            column.dataField &&
            column.tableName
          ) {
            const columnMetadata = metadata.find(
              (meta) =>
                meta.ColumnName.toLowerCase() ===
                  column.dataField.toLowerCase() &&
                meta.TableName.toLowerCase() === column.tableName.toLowerCase()
            );

            this.columnMaxLengthWidths[column.dataField] =
              this.calculateColumnWidth(column, columnMetadata);
          }
        });

      });
  }

  private calculateColumnWidth(column: any, metadata?: ColumnMetadata): string {
    // Default widths based on editor type
    const typeWidths: { [key: string]: string } = {
      '1': '120px', // text
      '2': '120px', // text
      '3': '150px', // date
      '4': '150px', // dropdown
      '5': '50px', // checkbox
      '6': '50px', // checkbox
    };

    let baseWidth = typeWidths[column.editorType] || '150px';
    const baseWidthValue = parseInt(baseWidth);

    // If we have metadata, adjust width based on data type and length
    if (metadata) {
      const isCharacterType =
        /varchar2|char|nchar|nvarchar2|clob|nclob|text/i.test(
          metadata.DataType
        );
      const isNumberType = /number|numeric|float|decimal|integer/i.test(
        metadata.DataType
      );

      if (isCharacterType) {
        // For character types, calculate width based on max length
        const charLength = metadata.CharColDeclLength || 0;
        if (charLength > 0) {
          const charWidth = 8; // approximate pixels per character
          const calculatedWidth = Math.max(
            charLength * charWidth,
            baseWidthValue // Use base width as minimum
          );
          baseWidth = `${Math.min(calculatedWidth, 400)}px`; // Cap at 400px
        }
      } else if (isNumberType) {
        // For numeric types, calculate based on precision and scale
        const precision = metadata.DataPrecision || 10;
        const scale = metadata.DataScale || 0;

        // Estimate width based on total digits
        const totalDigits = precision + (scale > 0 ? 1 : 0); // +1 for decimal point
        const digitWidth = 10; // pixels per digit
        const calculatedWidth = Math.max(
          totalDigits * digitWidth,
          baseWidthValue // Use base width as minimum
        );
        baseWidth = `${Math.min(calculatedWidth, 300)}px`; // Cap at 300px
      }
    }

    return baseWidth;
  }

  // Get width for a specific column
  getColumnMaxlengthWidth(columnName: string): string {
    return this.columnMaxLengthWidths[columnName] || '150px';
  }
}
