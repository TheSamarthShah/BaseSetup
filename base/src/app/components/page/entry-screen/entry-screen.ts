import { CommonModule } from '@angular/common';
import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  signal,
  Signal,
  ViewChild,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ActivatedRoute } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, of, take } from 'rxjs';
import { API_ENDPOINTS } from 'src/app/shared/api-endpoints';
import { AppInfoService } from 'src/app/shared/services/app-info.service';
import { MenuEventsService } from 'src/app/shared/services/menu-events.service';
import { TaskDataService } from 'src/app/shared/services/task-data.service';
import { SharedModule } from 'src/app/shared/shared.module';
import { Button } from 'src/core/components/button/button';
import { Checkbox } from 'src/core/components/checkbox/checkbox';
import { DateTime } from 'src/core/components/datetime/datetime';
import { DialogBox } from 'src/core/components/dialogbox/dialogbox';
import { DropDown } from 'src/core/components/dropdown/dropdown';
import { MenuButton } from 'src/core/components/menuButton/menuButton';
import { Multiselect } from 'src/core/components/multiselect/multiselect';
import { NumberInput } from 'src/core/components/number-input/number-input';
import { ReferenceScreenButton } from 'src/core/components/reference-screen-button/reference-screen-button';
import { ReferenceScreenDialog } from 'src/core/components/reference-screen-dialog/reference-screen-dialog';
import { Splitbutton } from 'src/core/components/splitbutton/splitbutton';
import { TabControl } from 'src/core/components/tabcontrol/tabcontrol';
import { TextInput } from 'src/core/components/text-input/text-input';
import { ColumnMetadata } from 'src/core/models/column-metadata.type';
import { entryTabConfig } from 'src/core/models/entry.type';
import { ColumnMetadataService } from 'src/core/services/column-metadata-service';
import { CryptoService } from 'src/core/services/crypto-encrypt-decrypt-service';
import { notify } from 'src/core/services/toast.service';
import { ActyDatePipe } from '../../../core/pipe/acty-date-pipe';
import { Splitter } from 'src/core/components/splitter/splitter';
import { Grid } from 'src/core/components/grid/grid';
import { GRID } from 'src/core/models/grid.type';
import { FILTER } from 'src/core/models/filter.type';

@Component({
  selector: 'app-entry-screen',
  templateUrl: './entry-screen.html',
  styleUrl: './entry-screen.scss',
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    TranslateModule,
    TextInput,
    ReferenceScreenButton,
    SharedModule,
    Checkbox,
    DropDown,
    ReferenceScreenDialog,
    NumberInput,
    TabControl,
    Button,
    Multiselect,
    Splitbutton,
    MenuButton,
    DialogBox,
    MatTooltipModule,
    ActyDatePipe,
    Splitter,
    Grid,
  ],
})
export class EntryScreen implements OnInit {
  @ViewChild('TabControl') tabControl!: TabControl;
  @ViewChild('RefScreen') dialogBox!: DialogBox;

  bottomTabLabel = ['基本情報', '構成情報', '工順情報'];

  translate = inject(TranslateService);
  route = inject(ActivatedRoute);
  appInfoService = inject(AppInfoService);
  taskDataService = inject(TaskDataService);
  menuEvents = inject(MenuEventsService);
  cryptoService = inject(CryptoService);
  cookieService = inject(CookieService);

  entryScreenTabs = signal<entryTabConfig[]>([]);
  screenBtns = signal<any[]>([]);
  entryFormFields = signal<any>(undefined);
  FormColumns = signal<any>(undefined);

  routeSub: any;
  screenName: string = '';
  formConfig: any;
  currentParent: any;
  currentModule: any;
  mainMenus: any[] = [];
  screenIcon: string = '';
  configAPI: string = API_ENDPOINTS.BASE + '/config';
  form: FormGroup = new FormGroup({});
  formId: string = 'MITEM0010U';
  userId: string = JSON.parse(this.cookieService.get('user') ?? '').userid;
  fieldsPerRow = 4;
  IsOccupyFullWidth: boolean = false;
  datasource: any[] = [];
  paramsData: any;
  readonlyForm: boolean = false;


  dataGrid = signal<GRID[]>([]);
    isEditableGrid: boolean = false;
    selectionMode = signal<'single' | 'multiple'>('single');
    GridMenuBtns = signal<any[]>([]);
    gridFilters: FILTER[] = [];
    isCellSummary = signal<boolean>(false);
    showExport = signal<boolean>(true);
    showSortData = signal<boolean>(true);
    showSwapColumns = signal<boolean>(true);
    pageSizes = signal<number[]>([25, 50, 75, 100]);
    exportUrl: string = API_ENDPOINTS.BASE + '/mitem0010u/Exportdata';
  getDataUrl: string = API_ENDPOINTS.BASE + '/mitem0010u/getdata';

  ngOnInit() {
    this.menuEvents.childClick$.subscribe((item: any) => {
      setTimeout(() => {
        if (!item) {
          return;
        }
        if (item.main?.children) {
          this.currentModule = item.main?.name;
        }
      }, 10);
    });

    this.routeSub = this.route.paramMap.subscribe((params) => {
      const newScreenName = params.get('screen');
      if (newScreenName && newScreenName !== this.screenName) {
        this.screenName = newScreenName;

        this.appInfoService
          .getConfigData('tgColumnInfo.' + this.screenName)
          .then((config) => {
            if (config) {
              this.formConfig = config;
              this.screenBtns.set(this.formConfig?.entryScreenBtns);
              this.entryFormFields.set(this.formConfig?.entryFormFields2);
              this.entryScreenTabs.set(
                this.formConfig?.gridInfo?.entryScreenTabs
              );
              this.FormColumns.set(this.formConfig?.gridInfo?.entryFormColumns);
              this.FormColumns.set(4);
              this.buildForm();

              const paramData = atob(
                this.route.snapshot.queryParamMap.get('pktData') ?? ''
              );
              if (paramData) {
                this.cryptoService.decryptData(paramData ?? '').then((x) => {
                  this.paramsData = x;
                  if (x.btnName && x.btnName != 'NewData') {
                    if (x.btnName == 'CopyData') {
                      this.screenBtnsVisibility('CORE.GRID.CopyData', false);
                      this.screenBtnsVisibility('CORE.GRID.DeleteData', false);
                    } else if (x.btnName == 'EditData') {
                      this.screenBtnsVisibility('CORE.GRID.EditData', false);
                    }
                    const primaryField = this.entryFormFields().filter(
                      (x: any) => x.isPrimaryKey === true
                    )?.[0].dataField;
                    const payload = {
                      [primaryField]: {
                        From: x.filters[primaryField],
                        To: '',
                        Type: 8,
                      },
                    };
                    this.bindFormData(payload, primaryField, x?.btnName);
                  } else if (x.btnName == 'NewData') {
                    this.screenBtnsVisibility('CORE.GRID.NewData', false);
                    this.screenBtnsVisibility('CORE.GRID.CopyData', false);
                    this.screenBtnsVisibility('CORE.GRID.DeleteData', false);
                  }
                  if (!x?.inSameTab) {
                    this.screenBtnsVisibility('CORE.GRID.Return', false);
                  }
                });
              }
              this.generateColumnMaxLengthWidth();
            }
          });

          this.appInfoService
          .getConfigData('tgColumnInfo.' + 'SIBHAVESH_TEST')
          .then((config) => {
            if (config) {
            this.formConfig = config;
            this.dataGrid.set(this.formConfig.dataGrid);
            this.selectionMode.set(this.formConfig.gridInfo.selectionMode);
            this.GridMenuBtns.set(this.formConfig.enquiryGridMenuBtns);
            this.isCellSummary.set(this.formConfig.gridInfo.isCellSummary);
            this.showExport.set(this.formConfig.gridInfo.showExport);
            this.showSortData.set(this.formConfig.gridInfo.showSortData);
            this.showSwapColumns.set(this.formConfig.gridInfo.showSwapColumns);
            this.pageSizes.set(this.formConfig.gridInfo.pageSizes);
          }
          });
      }
    });

    this.getScreenIcon();

    this.datasource = [
      { code: '1', caption: 'Option 1' },
      { code: '2', caption: 'Option 2' },
    ];
  }

  buildForm() {
    const controls: { [key: string]: FormControl } = {};
    this.entryFormFields().forEach((field: any) => {
      controls[field.dataField] = new FormControl('');
    });
    this.form = new FormGroup(controls);
  }

  bindFormData(payload: object, primaryField?: string, btnName?: string) {
    this.taskDataService
      .getConditionData(this.screenName + '/getData', payload)
      .then((x: any) => {
        const data = x.Data.Records?.[0];
        const entryFormPatch: any = {};
        Object.keys(this.form.value).forEach((key) => {
          if (key in data) {
            // if (btnName && btnName == "CopyData" && key == primaryField)
            if (btnName && btnName == 'CopyData') {
              if (key != primaryField) {
                entryFormPatch[key] = data[key];
              }
            } else {
              entryFormPatch[key] = data[key];
            }
          }
        });
        this.form.patchValue(entryFormPatch);
        // console.log(this.form.value);
      });

    this.entryFormFields().filter((x: any) => x.isPrimaryKey === true)[0]
      .dataField;
  }

  btnClicked(btnName: string) {
    if (btnName == 'CORE.GRID.SaveBtn' || btnName == 'CORE.GRID.DeleteData') {
      console.log(this.form.value);
      // const convertedFormValues = Object.fromEntries(
      //   Object.entries(this.form.value).map(([key, value]) => [
      //     key,
      //     typeof value === "boolean" ? (value ? "1" : "0") : value
      //   ])
      // );

      const convertedFormValues = Object.fromEntries(
        Object.entries(this.form.value).map(([key, value]) => {
          if (typeof value === 'boolean') {
            return [key, value ? '1' : '0'];
          } else if (value === '') {
            return [key, null];
          } else {
            return [key, value];
          }
        })
      );

      const payload = {
        [this?.paramsData?.btnName == 'NewData'
          ? 'AddList'
          : this?.paramsData?.btnName == 'CopyData'
          ? 'AddList'
          : this?.paramsData?.btnName == 'EditData'
          ? btnName == 'CORE.GRID.DeleteData'
            ? 'DeleteList'
            : 'UpdateList'
          : '']: [convertedFormValues],
      };
      this.taskDataService
        .saveFilterConditions(this.screenName + '/savedata', payload)
        .then((x) => {
          notify('Data Saved Successfully', 'success');
        })
        .catch((err) => notify(err, 'error'));
    } else if (btnName == 'CORE.GRID.Return') {
      window.history.back();
    }
  }

  screenBtnsVisibility(btnName: string, visibility: boolean) {
    // const btn = this.screenBtns().find(x => x.name === btnName);
    // if (btn) {
    //   btn.IsVisible = visibility;
    // }
    this.screenBtns.set(
      this.screenBtns().map((btn) =>
        btn.name === btnName ? { ...btn, IsVisible: visibility } : btn
      )
    );
  }

  get VisibleScreenBtns() {
    return this.screenBtns().filter((x) => x.IsVisible == true);
  }

  get TabLables() {
    return this.entryScreenTabs().map((tab) => {
      return this.translate.instant(tab?.tabCaption);
    });
  }

  getTabFields(tabCaption?: string) {
    if (tabCaption) {
      return this.entryFormFields().filter(
        (field: any) => field?.tabGroup?.tabCaption == tabCaption
      );
    } else {
      return this.entryFormFields();
    }
  }

  getScreenIcon() {
    this.appInfoService.getConfigData('tgMainMenuItems').then((res: any[]) => {
      this.mainMenus = res;

      this.screenIcon = this.mainMenus
        .flatMap((menu) => [menu, ...(menu.children ?? [])])
        .flatMap((subMenu) => [subMenu, ...(subMenu.children ?? [])])
        .filter((item) => item.path && item.path.endsWith(this.screenName))
        .map((item) => item.icon)[0];
    });
  }

  onReferenceSelected(event: any) {
    this.form.get(event.refForColumn)?.setValue(event.selectedValue);
  }

  onTabKeydown(event: KeyboardEvent, tabIndex: number) {
    // Only handle forward or backward Tab
    if (event.key !== 'Tab') return;

    const tabsArray = this.tabControl.tabs.toArray();
    const currentTab = tabsArray[tabIndex]?.nativeElement;
    if (!currentTab) return;

    const focusableSelectors =
      'input, textarea, select, button, [tabindex]:not([tabindex="-1"])';
    const focusable = Array.from(
      currentTab.querySelectorAll(focusableSelectors)
    ) as HTMLElement[];

    // filter only visible & enabled
    const visibleFocusable = focusable.filter(
      (el: HTMLElement) =>
        !el.hasAttribute('disabled') && el.offsetParent !== null
    );

    if (visibleFocusable.length === 0) return;

    const active = document.activeElement as HTMLElement;
    const isLastField =
      active === visibleFocusable[visibleFocusable.length - 1];
    const isFirstField = active === visibleFocusable[0];

    // === Handle Shift+Tab (go to previous tab) ===
    if (event.shiftKey && isFirstField && tabIndex > 0) {
      event.preventDefault();
      const prevIndex = tabIndex - 1;
      this.tabControl.selectTab(prevIndex);

      setTimeout(() => {
        const prevTab = tabsArray[prevIndex]?.nativeElement;
        if (!prevTab) return;
        const prevFocusable = Array.from(
          prevTab.querySelectorAll(focusableSelectors)
        ) as HTMLElement[];
        const visiblePrev = prevFocusable.filter(
          (el: HTMLElement) =>
            !el.hasAttribute('disabled') && el.offsetParent !== null
        );
        visiblePrev[visiblePrev.length - 1]?.focus();
      }, 100);
      return;
    }

    // === Handle normal Tab (go to next tab) ===
    if (!event.shiftKey && isLastField && tabIndex < tabsArray.length - 1) {
      event.preventDefault();
      const nextIndex = tabIndex + 1;
      this.tabControl.selectTab(nextIndex);

      setTimeout(() => {
        const nextTab = tabsArray[nextIndex]?.nativeElement;
        if (!nextTab) return;
        const nextFocusable = Array.from(
          nextTab.querySelectorAll(focusableSelectors)
        ) as HTMLElement[];
        const visibleNext = nextFocusable.filter(
          (el: HTMLElement) =>
            !el.hasAttribute('disabled') && el.offsetParent !== null
        );
        visibleNext[0]?.focus();
      }, 100);
    }
  }

  test() {
    this.dialogBox.openDialog();
  }

  private columnMaxLengthWidths: { [key: string]: string } = {};
  metadataService = inject(ColumnMetadataService);
  generateColumnMaxLengthWidth(): void {
    const dataGrid = this.entryFormFields();
    console.log(dataGrid);
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
    //return '100%';
    return this.columnMaxLengthWidths[columnName] || '150px';
  }

  isRequiredColumn(column: string): boolean {
    const gridColumn = this.entryFormFields().find(
      (col: any) => col.dataField === column
    );
    return gridColumn && gridColumn.isRequired ? gridColumn.isRequired : false;
  }

  getColumnTooltip(column: string): string {
    const gridColumn = this.entryFormFields().find(
      (col: any) => col.dataField === column
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

  getRowStatusTooltip(): string {
    const requiredColumns: string[] = [];

    // Find all required columns from _dataGrid
    this.entryFormFields().forEach((col: any) => {
      if (col.isEditable && col.isRequired && col.dataField == 'Jancd') {
        const columnName = this.translate.instant(col.caption);
        requiredColumns.push(`必須入力項目`);
      }
    });

    if (requiredColumns.length === 0) {
      return '';
    }

    // Join with newline character
    return requiredColumns.join('\n');
  }

  hasFieldInPosition(rowIndex: string, columnIndex: string): boolean {
    const fields = this.entryFormFields().filter(
      (field: any) =>
        field.IsVisible &&
        field.rowIndex === rowIndex &&
        field.ColumnGroupNumber === columnIndex
    );
    return fields.length > 0;
  }

  // Keep the existing methods:
  getMaxColumns(): number {
    let maxColumns = 0;
    this.entryFormFields().forEach((field: any) => {
      if (field.IsVisible && field.ColumnGroupNumber) {
        const colNum = parseInt(field.ColumnGroupNumber);
        if (colNum > maxColumns) {
          maxColumns = colNum;
        }
      }
    });
    return maxColumns || 1;
  }

  getColumnRange(): number[] {
    const maxColumns = this.getMaxColumns();
    return Array.from({ length: maxColumns }, (_, i) => i + 1);
  }

  getRowIndexes(): string[] {
    const rowIndexes = new Set<string>();
    this.entryFormFields().forEach((field: any) => {
      if (field.IsVisible && field.rowIndex) {
        rowIndexes.add(field.rowIndex);
      }
    });
    return Array.from(rowIndexes).sort((a, b) => parseInt(a) - parseInt(b));
  }

  getFieldByRowAndColumn(rowIndex: string, columnIndex: string): any[] {
    return this.entryFormFields().filter(
      (field: any) =>
        field.IsVisible &&
        field.rowIndex === rowIndex &&
        field.ColumnGroupNumber === columnIndex
    );
  }
  getColumnGroups(): string[] {
    const groups = new Set<string>();
    this.entryFormFields().forEach((field: any) => {
      if (field.IsVisible && field.ColumnGroupNumber) {
        groups.add(field.ColumnGroupNumber);
      }
    });
    return Array.from(groups).sort((a, b) => parseInt(a) - parseInt(b));
  }

  getRowsForGroup(groupNo: string): string[] {
    const rows = new Set<string>();
    this.entryFormFields().forEach((field: any) => {
      if (
        field.IsVisible &&
        field.ColumnGroupNumber === groupNo &&
        field.rowIndex
      ) {
        rows.add(field.rowIndex);
      }
    });
    return Array.from(rows).sort((a, b) => parseInt(a) - parseInt(b));
  }

  getFieldsForRow(rowIndex: string, groupNo: string): any[] {
    return this.entryFormFields().filter(
      (field: any) =>
        field.IsVisible &&
        field.rowIndex === rowIndex &&
        field.ColumnGroupNumber === groupNo
    );
  }

  // Helper methods for styling
  isCellUpdated(dataField: string, formValue: any): boolean {
    // Implement your update detection logic
    return false;
  }

  hasColumnError(dataField: string, formValue: any): boolean {
    // Implement your error detection logic
    return false;
  }

  getKBNNmUsingKey(value: any, dataField: string): string {
    // Implement your KBN name lookup logic
    return value;
  }

  onEditChange(formValue: any, dataField: string, newValue: string): void {
    // Implement your edit change logic
    formValue[dataField] = newValue;
  }
}
