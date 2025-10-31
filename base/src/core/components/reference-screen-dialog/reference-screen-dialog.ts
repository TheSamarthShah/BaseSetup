import { ChangeDetectorRef, Component, ComponentFactoryResolver, effect, ElementRef, HostListener, inject, OnInit, signal, ViewChild, ViewContainerRef } from '@angular/core';
import { DialogBox } from "../dialogbox/dialogbox";
import { ReferenceScreenService } from 'src/core/services/reference-screen-service';
import { refScreenColumns } from 'src/core/models/refScreenColumns.type';
import { FILTER } from 'src/core/models/filter.type';
import { Grid } from "../grid/grid";
import { Splitter } from "../splitter/splitter";
import { MaterialFilterComponent, MaterialFilterModule } from "../master-filter/material-filter.component";
import { MatIconModule } from '@angular/material/icon';
import { CORE_CONFIG } from 'src/core/core.config.token';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Button } from '../button/button';
import { ReferenceInitialSearchkbn } from "../reference-initial-searchkbn/reference-initial-searchkbn";
import { EXTRA_BTN } from 'src/core/models/extraButton.type';
import { ActyCommon } from 'src/core/services/acty-common';
import { notify } from 'src/core/services/toast.service';

@Component({
  selector: 'acty-reference-screen-dialog',
  imports: [DialogBox, Grid, MaterialFilterModule, Splitter, MatIconModule, TranslateModule, Button, ReferenceInitialSearchkbn],
  templateUrl: './reference-screen-dialog.html',
  styleUrl: './reference-screen-dialog.scss'
})
export class ReferenceScreenDialog implements OnInit {
  @ViewChild('dropdownRef') dropdownRef: any;
  @ViewChild('refInitialSearchKBN') refInitialSearchKBN: any;
  @ViewChild('RefScreen') dialogBox!: DialogBox;
  @ViewChild('filterWrapper') filterWrapper!: ElementRef;
  @ViewChild('splitter', { static: true }) splitter!: Splitter;
  @ViewChild('materialFilter') materialFilter!: MaterialFilterComponent;
  @ViewChild('mainDiv', { static: false }) mainDiv!: ElementRef<HTMLDivElement>;
  @ViewChild('titleBar', { static: false }) titleBar!: ElementRef<HTMLDivElement>;
  @ViewChild(Grid) gridComponent!: Grid;
  @ViewChild('container', { read: ViewContainerRef }) container!: ViewContainerRef;
  //@ViewChild('notification') notification!: Notification;
  
  referenceScreenService = inject(ReferenceScreenService);
  coreConfig = inject(CORE_CONFIG);
  translate = inject(TranslateService);
  resolver = inject(ComponentFactoryResolver)
  ActyCommonService = inject(ActyCommon)


  pageSize = [25, 50, 75, 100];
  FilertText: any = '';
  textContent: any = '';
  ReferenceSettingText: any = '';

  refTableName: string = '';
  queryID: string = '';
  refTitleCaption: string = '';
  formId: string = '';
  userId: string = '';
  refColumns: refScreenColumns[] = [];
  refForColumn: string = '';
  selectedValue: string | string[] = '';
  rowId: number = -1;
  gridId: string = '';
  customFilters: any[] = [];
  dataGrid: any[] = [];
  defaultValue: { [key: string]: any } = {};
  firstPanelSize = 0;
  firstPanelMaxRem = 20;     
  firstPanelMinRem = 5;
  firstPanelMinSize = 3.5;
  AddtionalData: any;
  gridFilters: any;
  showFilter = true;
  currentPageIndex = 0;
  openReferenceInitialDailog : boolean = false;
  getDataUrl = this.coreConfig.getReferenceScreenDataAPI;
  filterExtraBtns : EXTRA_BTN[] = [
    {
      text: "CORE.REFERENCESCREEN.ReferencesSettingOpenBtn",
      type: "outlined",
      btnClass: "",
      leftIcon: "settings",
      severity: "primary",
      rightIcon: "",
      disabled : false,
      IsVisible : true
    }
  ]

  // if the column name with its value is given then it'll use it every time. The value comes from form.
  // gridRefData is for setting data without opening reference dialog
  gridRefData: {
    refTableName: string;
    queryID: string;
    refColumns: refScreenColumns[];
    rowId: number;
    gridId?: string;
    refForColumn: string;
    selectedValue: string | string[];
    defaultValue: { [key: string]: any };
  } | null = null;

  // signals
  // Component state
  visible = signal(false);
  gridData = signal<any[]>([]);
  searchList = signal<FILTER[]>([]);
  isShowFilter = signal(true);
  // to show increament by 1 this.isLoading.update((n) => n + 1);
  // to hide decreament by 1 till 0 this.isLoading.update((n) => Math.max(n - 1, 0));
  pageSizeDrpDown = signal(this.pageSize[0]);
  rows = signal(this.pageSize[0]);

  private filterObserver: ResizeObserver | null = null;
  private _lastMeasuredFilterHeightPx: number | null = null;
  private _measurementAttempts = 0;
  private _initialObserverTimeout: any = null;

  constructor() {

    // save previous to check which variable is changed
    let prev: {
      visible: boolean;
      refColumns: refScreenColumns[];
      refTableName: string;
      queryID: string;
      refTitleCaption: string;
      formId: string;
      userId: string;
      refForColumn: string;
      selectedValue: string | string[];
      defaultValue: { [key: string]: any };
      rowId: number;
      gridId: string;
      gridRefData: {
        refTableName: string;
        queryID: string;
        refColumns: refScreenColumns[];
        rowId: number;
        gridId?: string;
        refForColumn: string;
        selectedValue: string | string[];
        defaultValue: { [key: string]: any };
      } | null;
    } = {
      visible: this.referenceScreenService.isVisible(),
      refColumns: this.referenceScreenService.refColumns(),
      refTableName: this.referenceScreenService.refTableName(),
      queryID: this.referenceScreenService.queryID(),
      refTitleCaption: this.referenceScreenService.refTitleCaption(),
      formId: this.referenceScreenService.formId(),
      userId: this.referenceScreenService.userId(),
      refForColumn: this.referenceScreenService.refForColumn(),
      selectedValue: this.referenceScreenService.selectedValue() ?? '',
      rowId: this.referenceScreenService.rowId(),
      gridId: this.referenceScreenService.gridId(),
      defaultValue: this.referenceScreenService.defaultValue(),
      gridRefData: this.referenceScreenService.gridRefData(),
    };
    effect(() => {
      // match current state with previous state to check which variable is changed
      const current: {
        visible: boolean;
        refColumns: refScreenColumns[];
        refTableName: string;
        queryID: string;
        refTitleCaption: string;
        formId: string;
        userId: string;
        refForColumn: string;
        selectedValue: string | string[];
        defaultValue: { [key: string]: any };
        rowId: number;
        gridId: string;
        gridRefData: {
          refTableName: string;
          queryID: string;
          refColumns: refScreenColumns[];
          rowId: number;
          gridId?: string;
          refForColumn: string;
          selectedValue: string | string[];
          defaultValue: { [key: string]: any };
        } | null;
      } = {
        visible: this.referenceScreenService.isVisible(),
        refColumns: this.referenceScreenService.refColumns(),
        refTableName: this.referenceScreenService.refTableName(),
        queryID: this.referenceScreenService.queryID(),
        refTitleCaption: this.referenceScreenService.refTitleCaption(),
        formId: this.referenceScreenService.formId(),
        userId: this.referenceScreenService.userId(),
        refForColumn: this.referenceScreenService.refForColumn(),
        selectedValue: this.referenceScreenService.selectedValue() ?? '',
        defaultValue: this.referenceScreenService.defaultValue() ?? {},
        rowId: this.referenceScreenService.rowId(),
        gridId: this.referenceScreenService.gridId(),
        gridRefData: this.referenceScreenService.gridRefData(),
      };
      if (prev.visible !== current.visible) {
        this.visible.set(current.visible);
        if (current.visible === true) {
          this.dialogBox.openDialog()
          this.showDialog();
        }
      }
      if (prev.refColumns !== current.refColumns) {
        this.refColumns = current.refColumns;
      }
      if (prev.refTableName !== current.refTableName) {
        this.refTableName = current.refTableName;
      }
      if (prev.queryID !== current.queryID) {
        this.queryID = current.queryID;
      }
      if (prev.refTitleCaption !== current.refTitleCaption) {
        this.refTitleCaption = current.refTitleCaption;
      }
      if (prev.formId !== current.formId) {
        this.formId = current.formId;
      }
      if (prev.userId !== current.userId) {
        this.userId = current.userId;
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
      if (prev.gridId !== current.gridId) {
        this.gridId = current.gridId;
      }

      /**
       * If gridRefData is changed then set the necessary data for reference search.
       * Once the data is fetched then call the handleRowDoubleClick which sends the selected data.
       */
      if (current.gridRefData && prev.gridRefData !== current.gridRefData) {
        this.gridRefData = current.gridRefData;
        if (this.gridRefData?.refForColumn != '') {
          this.refColumns = [...(this.gridRefData?.refColumns ?? [])];
          this.refTableName = this.gridRefData?.refTableName ?? '';
          this.queryID = this.gridRefData?.queryID ?? '';
          this.refForColumn = this.gridRefData?.refForColumn ?? '';
          this.selectedValue = this.gridRefData?.selectedValue ?? '';
          this.defaultValue = this.gridRefData?.defaultValue ?? {};
          this.rowId = this.gridRefData?.rowId ?? -1;
          this.gridId = this.gridRefData?.gridId ?? '';

          // Initialize with '2' for exact match search
          this.initializeSearchList('2');
          const factory = this.resolver.resolveComponentFactory(Grid);
          const componentRef = this.container.createComponent(factory);
          
          componentRef.setInput('formId', 'ActyTestForm');
          componentRef.setInput('userId', 'BK');
          componentRef.setInput('dataGrid', this.dataGrid);
          componentRef.setInput('getDataUrl', this.getDataUrl);  
          componentRef.setInput('formTitle', '');
          componentRef.setInput('editableGrid', false);
          componentRef.setInput('GridMenuBtns', []);
          componentRef.setInput('additionalSearchData', this.getAddtionalData());
          
          componentRef.instance.ngOnInit?.();

          (async () => {
           // triggers async fetch
          await componentRef.instance.getData();
          const firstValue = componentRef.instance.dataList()[0];
          if(firstValue === null || firstValue === undefined){
            //this.notification.notify('warning','There is no relevant data.')
            notify('該当データがありません。','error');
          }
          if (componentRef.instance.dataList().length > 0) {
              this.handleRowDoubleClick(componentRef.instance.dataList()[0]);
            } else {
              const nullRowData: { [key: string]: any } = {};
              this.refColumns.forEach((col) => {
                nullRowData[col.columnName] = null;
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

  //get Addtioanl Data for References Screen 
  getAddtionalData(){
    return this.AddtionalData = {
            "TableName": this.refTableName,
            "QueryID": this.queryID,
            "Columns": this.getColumnList(),
            "FilterValues" : this.searchList()
          }
  }

  //return Column list for Grid and Filter Component
  getColumnList(){
    //Create List For Generating Column
    return this.refColumns.map((col: any) => ({
      Name: col.columnName,
      Datatype: Number(col.editorType),
      queryOrderBySeq: col.queryOrderBySeq,
    }));
  }
  
  private initializeSearchList(searchType?: string,searchValues? : string): void {
    const baseColumnName: string = this.refForColumn.replace(/_from|_to$/, '').toLocaleLowerCase();
    const updatedSearchList: FILTER[] = this.refColumns.map(
      (column): any => ({
        Name: column.columnName,
        Displayname: column.caption,
        colMetadataKey: {
          tableName: this.refTableName,
          columnName: column.columnName,
        },
        visible: column.searchVisible,
        required: false, // Default to false unless specified
        Valuefrom:
          column?.defaultValueColumnName &&
          column.defaultValueColumnName in this.defaultValue
            ? this.defaultValue[column.defaultValueColumnName]
            : column?.mainScreenColumnName === baseColumnName
            ? this.selectedValue ??
              (column.editorType === '4' && column.memberList
                ? column.memberList.map((m) => m.code)
                : [])
            : '',

        Valueto: '',
        Matchtype : Number(
          column?.defaultValueColumnName &&
          column.defaultValueColumnName in this.defaultValue &&
          this.defaultValue[column.defaultValueColumnName]
            ? '2'
            : searchType ?? (column.editorType === '1' ? '4' : '1')),
        Datatype: Number(column.editorType),
        memberList: column.memberList || [],
        Inputtype : Number(column.editorType),
        invalidInput: false,
        isReferenceScreen: false,
      })
    );
    this.searchList.set(updatedSearchList);
  }

  //When click on extra button of filter component
  extraFilterbtnClick(button : any){
    if(button.name === 'CORE.REFERENCESCREEN.ReferencesSettingOpenBtn'){
      this.openReferenceInitialDailog = true;
    }
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateScrollHeight();
    this.DOMAdjustments();
  }

  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Write all dom related stuff in this function so that finding it will be easy.
   * The stuff which needs to be calculated and updated on window resize and afterviewinit
   */
  private DOMAdjustments(): void {
  }

  // Pagination handler
  onPageChange(event: any) {
    this.currentPageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    //this.dataSource.paginator = this.paginator;
  }

  toggleFilter() {
    this.showFilter = !this.showFilter;

    if (this.showFilter) {
      setTimeout(() => this.adjustFirstPanelHeight(), 0);
    } else {
      this.firstPanelSize = this.firstPanelMinSize;

      if (this.showFilter) {
        this.adjustFirstPanelHeight();
      }
    }
    this.updateGridScrollHeight();
  }

  updateGridScrollHeight() {
    if (this.gridComponent) {
      this.gridComponent.updateScrollHeight();
    }
  }

  onSizeChange(newSize: number) {
    this.firstPanelSize = Math.max(this.firstPanelMinRem, Math.min(newSize, this.firstPanelMaxRem));
    this.updateGridScrollHeight();
  }

  adjustFirstPanelHeight() {
    if (!this.filterWrapper) return;

    const filterHeightPx = this.filterWrapper.nativeElement.scrollHeight;
    const filterHeightRem = filterHeightPx / 14;

    setTimeout(() => {
      this.firstPanelSize = Math.max(
        this.firstPanelMinRem,
        Math.min(filterHeightRem, this.firstPanelMaxRem)
      );
      this.updateGridScrollHeight();
    });
  }

  //when click on dialog close button
  onDialogClose() {
    this.closeDialog()
  }

  //initialize the grid  and filter component
  private initializeComponent(): void {
    // initialize with current value in the service which will be set from the button click
    this.refColumns = this.referenceScreenService.refColumns();
    this.refTableName = this.referenceScreenService.refTableName();
    this.queryID = this.referenceScreenService.queryID();
    this.refTitleCaption = this.referenceScreenService.refTitleCaption();
    this.formId = this.referenceScreenService.formId();
    this.userId = this.referenceScreenService.userId(),
    this.refForColumn = this.referenceScreenService.refForColumn();
    this.selectedValue = this.referenceScreenService.selectedValue() ?? '';
    this.rowId = this.referenceScreenService.rowId();
    this.gridId = this.referenceScreenService.gridId();

    this.customFilters = [
      {
        fields: []
      }
    ];
    const FilterValueConditionforText = [
      { option: "TASK.Search.~" },
      { option: "TASK.Search.IsEqualTo" },
      { option: "TASK.Search.NotEqualTo" },
      { option: "TASK.Search.StartsWith" },
      { option: "TASK.Search.DoesNotStartsWith" },
      { option: "TASK.Search.EndsWith" },
      { option: "TASK.Search.ItDoesNotEndsWith" },
      { option: "TASK.Search.Contains" },
      { option: "TASK.Search.DoesNotInclude" },
      { option: "TASK.Search.IsBlank" },
      { option: "TASK.Search.IsNotBlank" }
    ];

    const FilterValueConditionForNumber =
      [
        { option: "TASK.Search.~" },
        { option: "TASK.Search.IsEqualTo" },
        { option: "TASK.Search.NotEqualTo" },
        { option: "TASK.Search.IsBlank" },
        { option: "TASK.Search.IsNotBlank" }
      ]

    const editorTypeMap: { [key: number]: string } = {
      1: 'text',
      2: 'text',
      3: 'date',
      4: 'select',
      5: 'checkbox'
    };

    //Cretae List For Generating Filter Component
    this.customFilters[0].fields = this.refColumns
      .filter((col: any) => col.isVisibleInSearch === true) // keep only isVisibleInSearch true
      .map((col: any) => ({
        editorType: editorTypeMap[col.editorType] || 'text',
        caption: col.caption,
        dataField: col.columnName,
        IsVisible: col.isVisible,
        filterConditions: col.editorType === "2" ? FilterValueConditionForNumber : FilterValueConditionforText,
        isVisibleInSearch: col.isVisibleInSearch,
        queryOrderBySeq: col.queryOrderBySeq,
        mainScreenColumn: col.mainScreenColumnName,
      }));


    if (this.selectedValue) {
      const dataFields = this.refForColumn.replace(/_from|_to$/, '').toLowerCase();
      this.customFilters.forEach(block => {
        block.fields.forEach((field: any) => {
          if (field.dataField === dataFields) {
            field.value = this.selectedValue;
          }
        });
      });
    }

    //Create List For Genereating Gird Compoent
    this.dataGrid = this.refColumns.map((col: any) => ({
      dataField: col.columnName,
      caption: col.caption,
      editorType: col.editorType,
      IsVisible: true,
    }));

    //create list for addtional data
    this.getAddtionalData()
  }

  getDataSearch(filters: FILTER[]) {
    if (filters.length !== undefined) {
      if (this.gridComponent) {
        //passing data from filters
        const getSearchListFromFilter = filters.map((col: any) => ({
          Datatype: Number(col.data_type),
          Displayname: col.displayName,
          Inputtype: Number(col.data_type),
          Matchtype: Number(col.match_type),
          Name: col.name,
          Valuefrom: col.value_from,
          Valueto: col.value_to
        }));
        this.gridFilters = getSearchListFromFilter;
      }
      this.searchList.set(this.gridFilters)
      if (this.gridComponent) {
        setTimeout(() => {
          this.gridComponent?.getData();
        });
      }
      this.AddtionalData.FilterValues = this.searchList();
    }
  }


  async showDialog(): Promise<void> {
    setTimeout(() => {
      this.updateScrollHeight();
      this.adjustFirstPanelHeight();
      this.DOMAdjustments();
    }, 0);

    this.initializeComponent();
    //when default search or not in references screen dialog open
    const initialSearchKBN = await this.refInitialSearchKBN.getData();
    if (initialSearchKBN == '1') {
      this.materialFilter.submit();
      setTimeout(() => this.updateScrollHeight(), 0);
    } else {
      //remove selected value, as data is not being search on opening popup
      this.referenceScreenService.selectedValue.set('');
    }

    try {
        const node = this.filterWrapper?.nativeElement;
        if (node && 'ResizeObserver' in window) {
          // Reset measurement state
          this._measurementAttempts = 0;
          this._lastMeasuredFilterHeightPx = null;

          // Observe until the filter height stabilizes, then disconnect.
          this.filterObserver = new ResizeObserver(() => {
            try {
              const height = node.scrollHeight;

              // If first time, record and measure
              if (this._lastMeasuredFilterHeightPx === null) {
                this._lastMeasuredFilterHeightPx = height;
                this._measurementAttempts = 0;
                this.adjustFirstPanelHeight();
                return;
              }

              const diff = Math.abs(height - this._lastMeasuredFilterHeightPx);
              // small changes are considered stable
              if (diff <= 2) {
                this._measurementAttempts++;
              } else {
                this._measurementAttempts = 0;
                this._lastMeasuredFilterHeightPx = height;
              }

              this.adjustFirstPanelHeight();

              // When we observed stability for two consecutive callbacks, stop observing
              if (this._measurementAttempts >= 2) {
                try {
                  this.filterObserver?.disconnect();
                } catch (e) {}
                this.filterObserver = null;
                if (this._initialObserverTimeout) {
                  clearTimeout(this._initialObserverTimeout);
                  this._initialObserverTimeout = null;
                }
              }
            } catch (e) {
              // ignore measurement errors
            }
          });
          this.filterObserver.observe(node);

          // Fallback: if observer doesn't stabilize within 2s, run one final measurement and stop
          this._initialObserverTimeout = setTimeout(() => {
            try {
              this.filterObserver?.disconnect();
            } catch (e) {}
            this.filterObserver = null;
            this.adjustFirstPanelHeight();
            this._initialObserverTimeout = null;
          }, 1000);
        }
      } catch (e) {
        // ignore
    }
  }

  onClickVisibleInitialDialog(){
    this.openReferenceInitialDailog = true;
  }
  onCloseReferenceInitialDialog(){
    this.openReferenceInitialDailog =false;
  }
  /**
   * sets the rowData as selected one and passes down
   * @param rowData
   */
  handleRowDoubleClick(rowData: any): void {
    const mainScreenColumnValues: { key: string; value: string }[] =
      this.setMainScreenColumnValues(rowData);

    const baseColumnName: string = this.refForColumn.replace(/_from|_to$/, '');
    const selectedValue: string = rowData[baseColumnName.toLowerCase()]?.toString() || '';

    // Validate default values if required
    for (const column of this.refColumns) {
      if (column.defaultValueColumnName) {
        let expected = this.defaultValue[column.defaultValueColumnName];
        let actual = rowData[column.columnName];

        if (column.editorType === '2') {
          expected = String(expected);
          actual = String(actual);
        } else if (column.editorType === '3') {
          expected = this.ActyCommonService.getUtcIsoDate(expected);
          actual = this.ActyCommonService.getUtcIsoDate(actual);
        }

        if (expected !== undefined && expected !== actual) {
          // this.messageService.add({
          //   severity: 'info',
          //   summary: INFOMSG.I0001,
          // });
          this.closeDialog();
          return;
        }
      }
      this.dialogBox.onClose()
    }

    this.referenceScreenService.referenceSelected.set({
      refForColumn: this.refForColumn,
      selectedValue: selectedValue,
      mainScreenColumnValues: mainScreenColumnValues,
      rowId: this.rowId,
      gridId: this.gridId,
    });
    this.closeDialog();
  }

  /**
   * this.refColumns() will have mainScreenColumn prop which will have mainscreen column name
   * so below function will make key value pair form those refColumns
   * @param rowData
   * @returns dictionary for mainscreen refColumns
   */
  setMainScreenColumnValues(rowData: any): { key: string; value: string }[] {
    return this.refColumns
      .filter((column: refScreenColumns) => column.mainScreenColumnName)
      .map((column: refScreenColumns) => ({
        key: column.mainScreenColumnName!,
        value: rowData[column.columnName]?.toString() || '',
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

    const availableHeight: number =
      dataDiv.clientHeight - paginationHeight;

    const tableContainer: HTMLElement = dataDiv.querySelector(
      '.p-datatable-table-container'
    ) as HTMLElement;
    if (tableContainer) {
      tableContainer.style.height = `${availableHeight}px`;
      tableContainer.style.maxHeight = `${availableHeight}px`;
    }
  }

  //when click on close dialog
  closeDialog(): void {
    this.gridData.set([]);
    this.referenceScreenService.closeRefScreen();
    this.dialogBox.onClose()

    try {
      this.filterObserver?.disconnect();
    } catch (e) {
      // ignore
    }
  }
}
