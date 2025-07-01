import {
  ChangeDetectorRef,
  Component,
  HostListener,
  inject,
  input,
  OnChanges,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { MessageService, SortEvent } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { DataChangeDetectedService } from '../../../services/core/data-change-detected.service';
import { ActyCommonService } from '../../../services/shared/acty-common.service';
import { CONFIRMMSG, ERRMSG, WARNMSG } from '../../../shared/messages';
import { COMMON, GRID_TEXT, TOROKU } from '../../../shared/jp-text';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { ReferenceScreenButtonComponent } from '../reference-screen-button/reference-screen-button.component';
import { MessageModule } from 'primeng/message';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { ActyDialogService } from '../../../services/shared/acty-dialog.service';
import { CheckboxModule } from 'primeng/checkbox';
import { SplitButtonModule } from 'primeng/splitbutton';
import { GRID_BTN } from '../../../model/core/grid.type';

@Component({
  selector: 'app-toroku-grid',
  imports: [
    TableModule,
    ButtonModule,
    InputGroup,
    InputGroupAddonModule,
    CommonModule,
    DialogModule,
    SelectModule,
    DatePickerModule,
    MaxLengthDirective,
    ReferenceScreenButtonComponent,
    MessageModule,
    FormsModule,
    InputTextModule,
    CheckboxModule,
    SplitButtonModule,
  ],
  templateUrl: './toroku-grid.component.html',
  styleUrl: './toroku-grid.component.scss',
})
export class TorokuGridComponent implements OnChanges {
  @ViewChild('dt') dataTable!: Table;

  //injected services
  DataChangeDetected = inject(DataChangeDetectedService);
  ActyCommonService = inject(ActyCommonService);
  messageService = inject(MessageService);
  cdr = inject(ChangeDetectorRef);
  actyDialogService = inject(ActyDialogService);

  // Inputs
  dataGrid = input.required<any>();
  dataList = input.required<any>();
  currMode = input<number>();
  formId = input.required<string>();
  formTitle = input.required<string>();
  gridId = input.required<string>();
  dbDataEdit = input<boolean>(true);
  addRow = input<boolean>(true);
  editRow = input<boolean>(true);
  deleteRow = input<boolean>(true);
  isMultiselect = input<boolean>(true);
  extraBtnsList = input<GRID_BTN[]>();
  refScreenDefaultValue = input<{ [key: string]: any }>({});

  //variable for all the texts stored in constants
  // Define both value and type with enum

  // Use the enum as the type directly
  rowErrors: { rowid: number; errorType: RowErrorType }[] = [];
  textContent: any = GRID_TEXT;
  primaryKeyColumns: string[] = [];
  saveList: any = {
    AddList: [],
    UpdateList: [],
    DeleteList: [],
  };
  //index used to give unique key to every row
  nextRowId: number = 1;
  //This is for the copyRow
  copyRowdata: any = [];
  selectedData: any;
  currentGridDataMode: 1 | 2 | 3 = 1; // 1: add, 2: edit, 3: copy
  oldData: any = {};
  currData: any = {};
  dialogVisible: boolean = false;
  textContentCommon: any = COMMON;
  errMsgs: any = ERRMSG;
  validationErrors: { [key: string]: { errorMessage: string } } = {};
  isTouchDevice: boolean = this.ActyCommonService.isTouchDevice();

  _dataList = signal<any>([]);
  visibleDataList = signal<any>([]);
  dataSaveMode = signal<string>('');
  refScreenOnRowData = signal({
    tableName: '',
    queryID: '',
    columns: [],
    rowId: -1,
    refForColumn: '',
    selectedValue: '',
    defaultValue: {},
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['dataList']) {
      let rowId = 1;

      const clonedList = structuredClone(this.dataList()).map((item: any) => {
        const newItem = { ...item, rowid: rowId };
        rowId++;
        return newItem;
      });

      this._dataList.set(structuredClone(clonedList));
      this.visibleDataList.set(structuredClone(clonedList));

      this.nextRowId = rowId;

      // reset save list
      this.saveList.AddList = [];
      this.saveList.UpdateList = [];
      this.saveList.DeleteList = [];

      this.DataChangeDetected.netRowChangeCounterReset();
      this.DataChangeDetected.dataChangeList =
        this.DataChangeDetected.dataChangeList.filter(
          (item: string) => !item.includes('_' + this.gridId())
        );

      this.selectedData = [];
    }

    if (changes['dataGrid']) {
      // set primary key columns for current grid component
      this.primaryKeyColumns = this.dataGrid()
        .filter((column: any) => column.primaryKey === true)
        .map((column: any) => column.name);
    }

    if (changes['formId']) {
      this.saveList.Formid = this.formId();
    }
  }

  /**
   * get the kbn value by its code from memberList
   * @param code
   * @param memberList
   * @returns
   */
  getKBNNm(
    code: string,
    memberList: { code: string; name: string }[]
  ): string | undefined {
    return memberList.find((l) => l.code === code)?.name;
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

  /**
   * Formats the data based on its data type
   * currently used for date and number
   * @param rowData
   * @returns
   */
  private formatRowData(rowData: any): any {
    const formattedData: any = {};

    this.dataGrid().forEach((column: any) => {
      if (column.gridIgnore !== true) {
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
                this.ActyCommonService.getUtcIsoDate(date);
            } else {
              formattedData[column.name] = null;
            }
            break;

          default: // String and other types
            formattedData[column.name] =
              value === '' || value === null ? null : value;
        }
      } else if (column.name?.startsWith('Updtdt')) {
        // for update date columns which is Updtdt
        const value = rowData[column.name];
        if (value) {
          const date = new Date(value);
          formattedData[column.name] = this.ActyCommonService.getUtcIsoDate(
            date,
            true
          );
        } else {
          formattedData[column.name] = null;
        }
      }
    });

    return formattedData;
  }

  async deleteRowData(rowId?: number): Promise<void> {
    const rowsToDelete =
      rowId != null ? [rowId] : this.selectedData.map((d: any) => d.rowid);

    if (!rowId || rowId === null) {
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

      if (result === 0) return;
    }

    if (!rowsToDelete || rowsToDelete.length === 0) return;

    for (const rId of rowsToDelete) {
      const _dataListIdx = this._dataList().findIndex(
        (d: any) => d.rowid === rId
      );
      const visibleDataListIdx = this.visibleDataList().findIndex(
        (d: any) => d.rowid === rId
      );
      const row = this.visibleDataList().find((d: any) => d.rowid === rId);
      // Handle the change counter based on whether the row was new
      if (row._isNew) {
        this.DataChangeDetected.netRowChangeCounterDecrement();
      } else {
        this.DataChangeDetected.netRowChangeCounterIncrement();
      }

      if (_dataListIdx !== -1) {
        this._dataList()[_dataListIdx]._isDelete = true;
      }
      // keep both if seperate for new row case
      if (visibleDataListIdx !== -1) {
        // remove from visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
        this.visibleDataList().splice(visibleDataListIdx, 1);
      }
      this.selectedData = [];
    }

    this.cdr.detectChanges();
  }

  //This function is called when user checks/unchecks the header checkbox
  onHeaderCheckboxToggle(event: any): void {
    if (event.checked) {
      this.selectedData = this.visibleDataList().filter(
        (item: any) => item._isNew || this.dbDataEdit()
      );
    } else {
      this.selectedData = [];
    }
  }

  /**
   * method for validating single row
   * @param rowData
   * @returns a list of columns and a corresponding message
   */
  private async validateRowData(rowData: any): Promise<boolean> {
    let hasError: boolean = false;

    for (const column of this.dataGrid()) {
      const value = rowData[column.name];

      // Required validation
      if (
        column.isRequired &&
        (value === null || value === '' || value === undefined)
      ) {
        this.validationErrors[column.name] = {
          errorMessage: this.errMsgs.E0009,
        };
      }

      // check for negative inputs
      if (column.dataType === '2' && column.isPositiveOnly && value < 0) {
        this.validationErrors[column.name] = {
          errorMessage: this.errMsgs.E0015,
        };
      }
    }

    // Look across the validationErrors—if any have a message, the verdict is error
    hasError = Object.values(this.validationErrors).some((v) =>
      v.errorMessage?.trim()
    );

    return hasError;
  }

  hasGridChanges(): any {
    const hasNewOrChanged = this.visibleDataList().some(
      (row: any) => row._isNew === true || row._isUpdated === true
    );

    // check deleted from _dataList because those rows are removed from visibleDataList
    const hasDeleted = this._dataList().some(
      (row: any) => row._isDelete === true
    );

    return hasNewOrChanged || hasDeleted;
  }

  //TODO - add setting left function for freeze effect
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
        this.selectedData = [];
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

  /**
   * fills up the remaining height of the screen with the grid by setting its height with that much px
   * @returns
   */
  updateScrollHeight(): void {
    setTimeout(() => {
      const tableContainer = document.querySelector(
        '.torokuDiv .p-datatable-table-container'
      ) as HTMLElement;

      // Measure height of the parent div
      const dataDiv = document.querySelector('.torokuDiv') as HTMLElement;
      const dataDivHeight = dataDiv?.clientHeight || 0;
      const tabsHeight =
        document.querySelector('.p-tablist-tab-list')?.clientHeight ?? 0;
      const headerHeight =
        document.querySelector('.p-datatable-header')?.clientHeight ?? 0;
      const padding = 28;
      const availableHeight =
        dataDivHeight - tabsHeight - headerHeight - padding - 2;

      if (tableContainer) {
        tableContainer.style.height = `${availableHeight}px`;
        tableContainer.style.maxHeight = `${availableHeight}px`;
      }
    }, 50); // small delay to ensure DOM is ready
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollHeight();
  }

  openEdit(rowData: any): void {
    this.currentGridDataMode = 2; // Set mode to Edit
    this.dataSaveMode.set(this.textContent.EDIT_DATA);

    // Transfer and clear _errors
    this.validationErrors = {};

    if (rowData._errors) {
      for (const columnName of Object.keys(rowData._errors)) {
        this.validationErrors[columnName] = {
          errorMessage: rowData._errors[columnName],
        };
      }
      delete rowData._errors; // Let the ghosts rest
    }
    let initialRowData = {};
    if (!rowData._isNew) {
      initialRowData = this._dataList().find(
        (item: any) => item.rowid === rowData.rowid
      );
    } else {
      initialRowData = rowData;
    }
    this.oldData = structuredClone(initialRowData);
    this.currData = structuredClone(rowData);
    this.dialogVisible = true;
  }

  openNew(): void {
    this.currData = {};
    this.currentGridDataMode = 1; // Set mode to New

    const updatedRowData = this.dataGrid()
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
    this.dataSaveMode.set(this.textContent.ADD_DATA);
    this.currData = structuredClone(updatedRowData);
    this.currData._isNew = true;
    this.dialogVisible = true;
  }

  hideDialog(): void {
    this.validationErrors = {};
    this.dialogVisible = false;
  }

  /**
   * onInput event to reset validation
   * @param inpName
   */
  onInput(inpName: string): void {
    if (this.validationErrors[inpName] !== undefined) {
      const currentMessage = this.validationErrors[inpName].errorMessage;

      if (currentMessage === this.errMsgs.E0008) {
        // Remove all fields that have the same E0008 error message
        for (const key in this.validationErrors) {
          if (this.validationErrors[key]?.errorMessage === this.errMsgs.E0008) {
            this.validationErrors[key].errorMessage = '';
          }
        }
      } else {
        // Just remove the error for this specific field
        this.validationErrors[inpName].errorMessage = '';
      }
    }
  }

  /**
   * This method for the all current data and old data comparison to check value change
   */
  changeDetectValidate(id: string, rowData: any): boolean {
    if (rowData._isNew) return false;
    const initialValue = (this.oldData as any)[id];
    const columnData = rowData[id];
    const gridColumn = this.dataGrid().find((col: any) => col.name === id);
    if (gridColumn.isEditable === false || gridColumn.primaryKey === true) {
      return false;
    }
    const dataType: string = gridColumn.dataType;
    // ColumnName_RowId_GridId
    const identifier: string = id + '_' + rowData.rowid + '_' + this.gridId();

    if (dataType === '1') {
      if ((initialValue ?? '') !== (columnData ?? '')) {
        this.DataChangeDetected.dataChangeListPush(identifier);
      } else {
        this.DataChangeDetected.dataChangeListRemove(identifier);
      }
    } else if (dataType === '2') {
      if (String(initialValue ?? '') !== String(columnData ?? '')) {
        this.DataChangeDetected.dataChangeListPush(identifier);
      } else {
        this.DataChangeDetected.dataChangeListRemove(identifier);
      }
    } else if (dataType === '3') {
      if (
        this.ActyCommonService.getUtcIsoDate(columnData) !==
        this.ActyCommonService.getUtcIsoDate(initialValue)
      ) {
        this.DataChangeDetected.dataChangeListPush(identifier);
      } else {
        this.DataChangeDetected.dataChangeListRemove(identifier);
      }
    } else if (dataType === '4') {
      if ((initialValue ?? '') !== (columnData ?? '')) {
        this.DataChangeDetected.dataChangeListPush(identifier);
      } else {
        this.DataChangeDetected.dataChangeListRemove(identifier);
      }
    }
    return true;
  }

  /**
   * This function is for the check the correct value is change or not if change then add bg color
   * @param id
   * @param columnData
   * @returns
   */
  checkValueChange(id: string, columnData: any): boolean {
    const initialValue = (this.oldData as any)[id];

    const gridColumn = this.dataGrid().find((col: any) => col.name === id);
    if (gridColumn.isEditable === false || gridColumn.primaryKey === true) {
      return false;
    }

    const dataType: string = gridColumn.dataType;

    if (dataType === '1') {
      return (initialValue ?? '') !== (columnData ?? '');
    } else if (dataType === '2') {
      return String(initialValue ?? '') !== String(columnData ?? '');
    } else if (dataType === '3') {
      return (
        this.ActyCommonService.getUtcIsoDate(columnData) !==
        this.ActyCommonService.getUtcIsoDate(initialValue)
      );
    } else if (dataType === '4') {
      return (initialValue ?? '') !== (columnData ?? '');
    } else if (dataType === '5') {
      return Boolean(initialValue) !== Boolean(columnData);
    }
    return false;
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
        updatedData[key] = value;
        if ((value === null || value === '') && event.refForColumn === key) {
          this.messageService.add({
            severity: 'warn',
            summary: WARNMSG.W0001,
            sticky: true,
          });
        }
      }
    }
    this.currData = updatedData;

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
   * This method is for the save the data when the add,edit and copy mode
   */
  async onDialogSaveData(): Promise<void> {
    const currentDialogMode = this.currentGridDataMode;
    const currentDialogData = this.currData;

    const hasError = await this.validateRowData(currentDialogData);
    if (hasError) {
      return;
    }

    if (currentDialogMode === 1) {
      let insertIdx = 0;
      currentDialogData.rowid = this.nextRowId;
      this.nextRowId += 1;
      // append row in visibleDataList(use splice because if reassigned then it will detect change in list and reset datatable)
      this.visibleDataList().splice(
        insertIdx,
        0,
        structuredClone(currentDialogData)
      );
      this.DataChangeDetected.netRowChangeCounterIncrement();
    } else if (currentDialogMode === 2) {
      const gridRow = this.visibleDataList().find(
        (row: any) => row.rowid === currentDialogData.rowid
      );
      if (gridRow) {
        Object.assign(gridRow, currentDialogData);

        // If not new, compare with initial data for maintaining _isUpdated row
        if (!gridRow._isNew) {
          const initialData = this._dataList().find(
            (row: any) => row.rowid === currentDialogData.rowid
          );

          if (initialData) {
            const formattedInitial = await this.formatRowData(initialData);
            const formattedCurrent = await this.formatRowData(gridRow);

            // Deep comparison — you may use lodash's isEqual for robustness
            const hasChanged =
              JSON.stringify(formattedInitial) !==
              JSON.stringify(formattedCurrent);

            gridRow._isUpdated = hasChanged;
          }
        }
      }
    }

    this.hideDialog();
  }

  async getSaveData(): Promise<{
    AddList: any;
    UpdateList: any;
    DeleteList: any;
  }> {
    const addListPromises: Promise<any>[] = [];
    const updateListPromises: Promise<any>[] = [];
    const deleteList: any[] = [];

    for (const row of this.visibleDataList()) {
      if (row._isNew || row._isCopy) {
        addListPromises.push(this.formatRowData(row));
      } else if (row._isUpdated) {
        updateListPromises.push(this.formatRowData(row));
      }
    }

    for (const row of this._dataList()) {
      if (row._isDelete) {
        deleteList.push(await this.formatRowData(row));
      }
    }

    const [addList, updateList] = await Promise.all([
      Promise.all(addListPromises),
      Promise.all(updateListPromises),
    ]);

    return {
      AddList: addList,
      UpdateList: updateList,
      DeleteList: deleteList,
    };
  }

  setDuplicateInsertRows(rows: Array<any>): number {
    const primaryKeyColumns = this.dataGrid().filter(
      (column: any) => column.primaryKey && column.visible
    );
    let firstInvalidRowId: number = -1;
    rows.forEach((duplicateRow) => {
      const matchingRows = this.visibleDataList().filter((row: any) => {
        return (
          row._isNew === true &&
          primaryKeyColumns.every((column: any) => {
            const columnName = column.name;
            const dataType = column.dataType;
            if (dataType === '3') {
              const visibleRowDate = new Date(row[columnName]);
              const duplicateRowDate = new Date(duplicateRow[columnName]);
              return (
                this.ActyCommonService.getUtcIsoDate(visibleRowDate) ===
                this.ActyCommonService.getUtcIsoDate(duplicateRowDate)
              );
            } else {
              return row[columnName] === duplicateRow[columnName];
            }
          })
        );
      });
      // Add errors
      matchingRows.forEach((row: any) => {
        // Avoid duplicate entries in rowErrors
        const alreadyExists = this.rowErrors.some(
          (e) =>
            e.rowid === row.rowid &&
            e.errorType === RowErrorType.DuplicateRowEntry
        );

        if (!alreadyExists) {
          this.rowErrors.push({
            rowid: row.rowid,
            errorType: RowErrorType.DuplicateRowEntry,
          });
        }

        // Track the first invalid row
        if (firstInvalidRowId === -1) {
          firstInvalidRowId = row.rowid;
        }
      });
      this.applyRowErrorsFromList();
    });

    this.cdr.detectChanges();
    return firstInvalidRowId;
  }

  applyRowErrorsFromList(): void {
    if (!this.rowErrors || this.rowErrors.length === 0) return;

    const primaryKeyColumns = this.dataGrid().filter(
      (column: any) => column.primaryKey && column.visible
    );

    for (const error of this.rowErrors) {
      const { rowid, errorType } = error;

      const row = this.visibleDataList().find((r: any) => r.rowid === rowid);
      if (!row) continue;

      // Initialize _errors if not present
      if (!row._errors) {
        row._errors = {};
      }

      switch (errorType) {
        case RowErrorType.DuplicateRowEntry:
          for (const col of primaryKeyColumns) {
            row._errors[col.name] = this.errMsgs.E0008;
          }
          break;

        // add more error types here...
      }
    }

    // Ensure the view is aware of changes
    this.cdr.detectChanges();
  }

  goToRow(rowId: number) {
    const selectedRow = this.visibleDataList().find(
      (row: any) => row.rowid === rowId
    );
    if (selectedRow) {
      this.selectedData = [selectedRow]; // Wrap in array since it's now plural
      this.scrollToSelectedRow();
    }
  }
}

enum RowErrorType {
  DuplicateRowEntry = 'DuplicateRowEntry',
}
