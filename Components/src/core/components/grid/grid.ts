import {
  Component,
  HostListener,
  inject,
  input,
  signal,
  ViewChild,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import {
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
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { FILTER } from '../../models/filter.type';
import {
  ColumnFilterState,
  FilterCondition,
  GRID,
  GRID_BTN,
} from '../../models/grid.type';
import { GetData } from '../../services/get-data';
import { GRID_TEXT } from '../../shared/jp-text';
import { Button } from '../button/button';
import { Multiselect, MultiselectOption } from '../multiselect/multiselect';

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
  ],
  templateUrl: './grid.html',
  styleUrl: './grid.scss',
})
export class Grid {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatTable) table!: MatTable<any>;

  service = inject(GetData);

  dataGrid = input.required<any[]>();
  dataList = signal<any[]>([]);
  visibleDataList = new MatTableDataSource<any>([]);
  getDataUrl = input.required<string>();
  searchList = input<Array<FILTER>>([]);
  pageSizes = input<number[]>([25, 50, 75, 100]);
  editableGrid = input.required<boolean>();
  showSanshoModeBtn = input<boolean>(true);
  showHenshuModeBtn = input<boolean>(true);
  showAddModeBtn = input<boolean>(true);
  showCopyModeBtn = input<boolean>(true);
  showSaveBtn = input<boolean>(true);
  addRow = input<boolean>(true);
  editRow = input<boolean>(true);
  copyRow = input<boolean>(true);
  deleteRow = input<boolean>(true);
  userId = input.required<string>();
  formId = input.required<string>();
  formTitle = input.required<string>();
  extraBtnsList = input<GRID_BTN[]>();
  sortableCols = input<boolean>(true);
  filterableCols = input<boolean>(true);

  gridFilter = signal<ColumnFilterState[]>([]);

  displayedColumns: string[] = [];
  editableMap: { [key: string]: boolean } = {};
  nextRowId: number = 1;
  selection!: SelectionModel<number>;
  textContent: any = GRID_TEXT;
  sortColumn: string = '';
  sortDirection: '' | 'asc' | 'desc' = '';
  conditions_string: {
    value: string;
    display: string;
  }[] = [
    { value: 'startsWith', display: 'Starts with' },
    { value: 'contains', display: 'Contains' },
    { value: 'notContains', display: 'Not Contains' },
    { value: 'endsWith', display: 'Ends with' },
    { value: 'equals', display: 'Equals' },
    { value: 'notEquals', display: 'Not Equals' },
  ];
  conditions_number: {
    value: string;
    display: string;
  }[] = [
    { value: 'equals', display: 'Equals' },
    { value: 'notEquals', display: 'Not Equals' },
    { value: 'lessThan', display: 'Less than' },
    { value: 'greaterThan', display: 'Greater than' },
  ];
  conditions_date: {
    value: string;
    display: string;
  }[] = [
    { value: 'dateIs', display: 'Date is' },
    { value: 'dateIsNot', display: 'Date is not' },
    { value: 'dateIsBefore', display: 'Date is before' },
    { value: 'dateIsAfter', display: 'Date is after' },
  ];

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollHeight();
  }

  ngOnInit() {
    this.selection = new SelectionModel<number>(
      this.editableGrid(), // true = multi-select, false = single-select
      []
    );

    // Initialize filter states for each column
    this.dataGrid().forEach((column) => {
      let defaultCondition: FilterCondition;
      if (column.dataType === '1') {
        defaultCondition = this.conditions_string[0].value as FilterCondition;
      } else if (column.dataType === '2') {
        defaultCondition = this.conditions_number[0].value as FilterCondition;
      } else {
        defaultCondition = this.conditions_date[0].value as FilterCondition;
      }

      this.gridFilter.set([
        ...this.gridFilter(),
        {
          columnname: column.name,
          matchMode: 'all',
          rules: [{ condition: defaultCondition, value: '' }],
        },
      ]);
    });

    this.displayedColumns = this.dataGrid()
      .filter((col) => col.visible && !col.gridIgnore)
      .sort((a, b) => (a.displaySeq ?? 999) - (b.displaySeq ?? 999))
      .map((col) => col.name);

    if (this.editableGrid()) {
      this.editableMap = this.dataGrid().reduce((acc, col) => {
        acc[col.name] = col.isEditable ?? false;
        return acc;
      }, {} as { [key: string]: boolean });
    }
  }

  getColumnDisplayName(columnName: string): string {
    return (
      this.dataGrid().find((c) => c.name === columnName)?.displayName ??
      columnName
    );
  }

  getColumnConfig(columnName: string): GRID | undefined {
    return this.dataGrid().find((c) => c.name === columnName);
  }

  onEditChange(row: any, column: string, value: any) {
    row[column] = value;
    const config = this.getColumnConfig(column);
    config?.onChangeCallback?.(row);
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
    this.nextRowId = rowid;
    this.dataList.set(structuredClone(updatedList));
    this.visibleDataList = new MatTableDataSource<any>(
      structuredClone(updatedList)
    );

    this.selection.select(this.visibleDataList.data[0].rowid);

    this.visibleDataList.paginator = this.paginator;
  }

  async getData(afterSave: boolean = false): Promise<void> {
    this.dataList.set([]);

    return new Promise((resolve, reject) => {
      this.service
        .getDataOfPage(
          this.searchList(),
          '',
          '',
          this.getDataUrl(),
          0,
          this.paginator.pageSize
        )
        .subscribe({
          next: (res) => {
            if (res.Code === 200) {
              this.dataList.set(res.Data.Records);
              this.modifyDataList();
              this.updateScrollHeight();
            } else if (res.Code === 201) {
            }
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
          },
          error: (err) => {
            // always pass err object in reject as it does console.error
            // which makes a toast from toast-error.service and http errors are skipped
            reject(err);
          },
        });
    });
  }

  fetchRemainingData(formGetUrl: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.service
        .getDataOfPage(
          this.searchList(),
          '',
          '',
          formGetUrl,
          this.paginator.pageSize,
          null
        )
        .subscribe({
          next: (res) => {
            if (res.Code === 200) {
              const completeData = this.dataList().concat(res.Data.Records);
              this.dataList.set(completeData);
              this.modifyDataList();
              this.updateScrollHeight();
            } else if (res.Code === 201) {
            }
            resolve();
          },
          error: (err) => {
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
      const dataDivHeight =
        document.querySelector('.dataDiv')?.clientHeight || 0;
      const padding = 20;

      const paginator = document.querySelector(
        '.dataDiv .grid-paginator'
      ) as HTMLElement;
      const paginationHeight = paginator.clientHeight;

      const caption = document.querySelector(
        '.dataDiv .grid-caption'
      ) as HTMLElement;
      const captionHeight = paginator.clientHeight;

      // Calculate available height dynamically
      const availableHeight =
        dataDivHeight -
        paginationHeight -
        captionHeight; /*  - headerHeight - padding*/
      const scrollHeight: string = `${availableHeight}px`;

      const dataDiv = document.querySelector(
        '.dataDiv .table-container'
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
        this.table.renderRows();
      }
    }, 200); // Small delay to ensure rendering is complete
  }

  get renderedColumns(): string[] {
    return ['select', 'no', ...this.displayedColumns];
  }

  handleRowClick(event: any, row: any): void {
    // Skip if click was on an inputable element (handled by stopPropagation)
    if (event.defaultPrevented) return;

    this.selection.toggle(row.rowid);
    this.table.renderRows(); // Force update of checkboxes
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
        ...this.visibleDataList.data.map((row: any) => row.rowid)
      );
    }
    this.table.renderRows();
  }

  isAllSelected(): boolean {
    return this.selection.selected.length === this.visibleDataList.data.length;
  }

  addNewRow(): void {
    const newRowData = this.dataGrid()
      //commented because needed to set hidden columns like updtdt from reference
      //there is code to set only columns in row data inside onReferenceScreenSelected
      //.filter((column: any) => column.visible === true)
      .reduce((acc: any, column: any) => {
        // Handle dropdowns
        if (column.memberList && column.memberList.length > 0) {
          acc[column.name] = column.memberList[0].code;
        }
        // Handle checkboxes
        else if (column.dataType === '5') {
          acc[column.name] = false; // Default checkbox to false (unchecked)
        }
        // All others default to null
        else {
          acc[column.name] = null;
        }
        return acc;
      }, {});
    newRowData._isNew = true;
    newRowData.rowid = this.nextRowId;
    this.nextRowId++;
    let insertIdx = 0;
    // append row in visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
    this.visibleDataList.data.splice(insertIdx, 0, structuredClone(newRowData));
    //this.DataChangeDetected.netRowChangeCounterIncrement();
    this.visibleDataList._updateChangeSubscription();
    this.table.renderRows();
  }

  async deleteRowData(rowId?: number): Promise<void> {
    const rowsToDelete =
      rowId != null ? [rowId] : this.selectedRows.map((d: any) => d.rowid);

    if (!rowId || rowId === null) {
      /*const result = await this.actyDialogService.show({
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

      if (result === 0) return;*/
    }

    if (!rowsToDelete || rowsToDelete.length === 0) return;

    for (const rId of rowsToDelete) {
      const dataListIdx = this.dataList().findIndex(
        (d: any) => d.rowid === rId
      );
      const visibleDataListIdx = this.visibleDataList.data.findIndex(
        (d: any) => d.rowid === rId
      );
      const row = this.visibleDataList.data.find((d: any) => d.rowid === rId);

      // Handle the change counter based on whether the row was new
      if (row._isNew) {
        //this.DataChangeDetected.netRowChangeCounterDecrement();
      } else {
        //this.DataChangeDetected.netRowChangeCounterIncrement();
      }

      if (dataListIdx !== -1) {
        this.dataList()[dataListIdx]._isDelete = true;
      }
      // keep both if seperate for new row case
      if (visibleDataListIdx !== -1) {
        // remove from visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
        this.visibleDataList.data.splice(visibleDataListIdx, 1);
        this.visibleDataList._updateChangeSubscription();
      }
      this.selection.clear();
    }
  }

  get selectedRows(): any[] {
    if (!this.visibleDataList?.data || !this.selection) {
      return [];
    }

    return this.visibleDataList.data.filter((row) =>
      this.selection.selected.includes(row.rowid)
    );
  }

  sortData(column: string) {
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
      this.visibleDataList.data = [...this.dataList()];
    }
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
    let columnObj = this.dataGrid().find((c) => c.name === col);
    if (columnObj.dataType === '2') return this.conditions_number;
    if (columnObj.dataType === '3') return this.conditions_date;
    return this.conditions_string;
  }

  addRule(col: string): void {
    let columnFilterObj = this.getColumnFilterState(col);
    let columnObj = this.dataGrid().find((c) => c.name === col);
    let defaultCondition: FilterCondition;
    if (columnObj.dataType === '1') {
      defaultCondition = this.conditions_string[0].value as FilterCondition;
    } else if (columnObj.dataType === '2') {
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

  applyFilter(): void {
    console.log(this.gridFilter());
  }

  clearFilter(col: string): void {
    let columnFilterObj = this.getColumnFilterState(col);
    columnFilterObj.matchMode = 'all';
    let columnObj = this.dataGrid().find((c) => c.name === col);
    let defaultCondition: FilterCondition;
    if (columnObj.dataType === '1') {
      defaultCondition = this.conditions_string[0].value as FilterCondition;
    } else if (columnObj.dataType === '2') {
      defaultCondition = this.conditions_number[0].value as FilterCondition;
    } else {
      defaultCondition = this.conditions_date[0].value as FilterCondition;
    }

    columnFilterObj.rules = [{ condition: defaultCondition, value: '' }];
  }

  getGridFilterMultiselectoptions(col: string): MultiselectOption[] {
    let columnobj = this.getColumnConfig(col);
    let convertedList: MultiselectOption[] = [];
    if (columnobj && columnobj.memberList) {
       convertedList= columnobj.memberList.map(
        (item) => ({
          key: item.code,
          label: item.name,
        })
      );
    }
    return convertedList;
  }
}
