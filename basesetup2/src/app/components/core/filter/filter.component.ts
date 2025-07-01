import {
  Component,
  inject,
  input,
  OnChanges,
  OnInit,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { CheckboxModule } from 'primeng/checkbox';
import { COMMON, FILTER_TEXT } from '../../../shared/jp-text';
import { FILTER } from '../../../model/core/filter.type';
import { ConditionSettingsComponent } from '../condition-settings/condition-settings.component';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { AutomaticAdjustmentService } from '../../../services/core/automatic-adjustment.service';
import { ReferenceScreenButtonComponent } from '../reference-screen-button/reference-screen-button.component';
import { ConditionSettingDisplayService } from '../../../services/core/condition-setting-display.service';
import { ActyCommonService } from '../../../services/shared/acty-common.service';
import { RadioButtonModule } from 'primeng/radiobutton';
import { InputGroup } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { MessageModule } from 'primeng/message';
import { ERRMSG } from '../../../shared/messages';

@Component({
  selector: 'app-filter',
  imports: [
    InputTextModule,
    SelectModule,
    InputGroup,
    InputGroupAddonModule,
    FormsModule,
    ButtonModule,
    RadioButtonModule,
    DatePickerModule,
    CheckboxModule,
    ConditionSettingsComponent,
    MaxLengthDirective,
    ReferenceScreenButtonComponent,
    MessageModule
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent implements OnInit, OnChanges {
  //display condition setting service
  dispCondSettingService = inject(ConditionSettingDisplayService);
  //Automatic Adjustment service
  AutomaticAdjustmentService = inject(AutomaticAdjustmentService);
  ActyCommonService = inject(ActyCommonService);

  userId = input.required<string>();
  formID = input.required<string>();
  filterTitle = input.required<string>();
  isBackGroundOn = input<boolean>();
  searchListInp = input.required<any[]>();
  showDisplayConditionSetting = input<boolean>(true);
  showAutomaticAdjustment = input<boolean>(true);

  searchListChanged = output<Array<FILTER>>();
  splitterToggle = output<boolean>();
  getDataTriggered = output();

  textContent: any = FILTER_TEXT;
  textContentCommon: any = COMMON;
  match_options_string: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: this.textContent.FILTER_MATCH_CONDITIONS.RANGE },
    { code: '2', name: this.textContent.FILTER_MATCH_CONDITIONS.EQ },
    { code: '3', name: this.textContent.FILTER_MATCH_CONDITIONS.NEQ },
    { code: '4', name: this.textContent.FILTER_MATCH_CONDITIONS.SW },
    { code: '5', name: this.textContent.FILTER_MATCH_CONDITIONS.NSW },
    { code: '6', name: this.textContent.FILTER_MATCH_CONDITIONS.EW },
    { code: '7', name: this.textContent.FILTER_MATCH_CONDITIONS.NEW },
    { code: '8', name: this.textContent.FILTER_MATCH_CONDITIONS.CON },
    { code: '9', name: this.textContent.FILTER_MATCH_CONDITIONS.NCON },
    { code: '10', name: this.textContent.FILTER_MATCH_CONDITIONS.IN },
    { code: '11', name: this.textContent.FILTER_MATCH_CONDITIONS.INN },
  ];
  match_options_num_date: {
    code: string;
    name: string;
  }[] = [
    { code: '1', name: this.textContent.FILTER_MATCH_CONDITIONS.RANGE },
    { code: '2', name: this.textContent.FILTER_MATCH_CONDITIONS.EQ },
    { code: '3', name: this.textContent.FILTER_MATCH_CONDITIONS.NEQ },
    { code: '10', name: this.textContent.FILTER_MATCH_CONDITIONS.IN },
    { code: '11', name: this.textContent.FILTER_MATCH_CONDITIONS.INN },
  ];
  isTouchDevice: boolean = this.ActyCommonService.isTouchDevice();
  allCheckedStates: any = {};
  requiredMsg:string = ERRMSG.E0009;
  
  searchList = signal<Array<FILTER>>([]);
  initialSearchList: FILTER[] = [];
  isShowFilter = signal<boolean>(true);
  conditionAdjustmentKBN = signal<string>('1');

  async ngOnInit(): Promise<void> {
    await this.getLastConditionSettingData();
    //This code for the filter visible or not code
    this.AutomaticAdjustmentService.GetAutoAdjustmenData(this.formID()).then(
      (autoAdjustKBN) => {
        this.conditionAdjustmentKBN.set(autoAdjustKBN);
      }
    );

    // Create a deep clone of the current searchList value
    const clonedList = structuredClone(this.searchList());
    this.initialSearchList  = clonedList;

    clonedList
      .filter((data) => data.data_type === '4')
      .forEach((column) => {
        this.onAllCheckboxChange(column, '');
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['searchListInp']) {
      this.searchList.set(this.searchListInp());
      this.searchListChanged.emit(this.searchList());
    }
  }

  getData(): void {

    //before get data validate that all required filter value is there
    //before checking required input reset all invalid flag
    this.searchList().forEach((d) => {
      d.invalidInput = false;
    });

    //before triggering event forst check for all required columns
    this.searchList().forEach((d) => {
      if (d.required && d.value_from === '' && d.value_to === '') {
        d.invalidInput = true;
      }
    });

    //if any invalid input is found, do not search the data
    if (this.searchList().find((d) => d.invalidInput)) return;

    //notify form component to search the data
    this.getDataTriggered.emit();
    //This condition is for the when the data is search that time the filter tab should be hidden if the condition adjustment kbn is 1
    if (this.conditionAdjustmentKBN() === '1') {
      this.isShowFilter.set(false);
      //call splitterToggle function to hide the filter tab
      this.splitterToggle.emit(false);
    }
  }

  OnInputEvent(name: string): void {
    const inputEle = this.searchList().find((l) => l.name === name);
    if (inputEle) {
      inputEle.invalidInput = false;
    }
  }
  
  resetFilter(): void {
    //notify form component the updated filter data
    this.searchListChanged.emit(this.initialSearchList);
    
    //After reset filter, create a deep clone of the initialSearchList
    const clonedList = structuredClone(this.initialSearchList);
    this.initialSearchList  = clonedList;

    //'すべて' (Select All) related check box is checked or not
    clonedList
      .filter((data) => data.data_type === '4')
      .forEach((column) => {
        this.onAllCheckboxChange(column, '');
      })
  }

  toggleFilter(): void {
    this.isShowFilter.set(!this.isShowFilter());
    //This splitterToggle function call to toggle the splitter
    this.splitterToggle.emit(this.isShowFilter());
  }

  conditionSettingsLoad(searchCols: Array<FILTER>): void {
    this.searchList.set(searchCols);
    this.searchListChanged.emit(this.searchList());

    // Create a deep clone of the searchCols value after condition setting changed
    const clonedList = structuredClone(searchCols);
    this.initialSearchList  = clonedList;

    clonedList
      .filter((data) => data.data_type === '4')
      .forEach((column) => {
        this.onAllCheckboxChange(column, '');
      });

    setTimeout(() => this.getData(), 10);
  }

  conditionAdjustmentKBNChanged(adjustmentKBN: string): void {
    this.conditionAdjustmentKBN.set(adjustmentKBN);
  }

  onGetDataTriggered(event: boolean): void {
    this.getDataTriggered.emit();
  }

  onReferenceSelected(event: {
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
  }): void {
    // Create a completely new array to ensure change detection
    const updatedFilters = JSON.parse(JSON.stringify(this.searchList()));

    // Determine if this is a _from or _to reference
    const isFromReference = event.refForColumn.endsWith('_from');
    const isToReference = event.refForColumn.endsWith('_to');
    const baseColumnName = event.refForColumn.replace(/_from|_to$/, '');

    // Update the filters
    updatedFilters.forEach(
      (filter: { name: string; value_from: string; value_to: string }) => {
        // Update other fields based on mainScreenColumnValues
        const matchingValue = event.mainScreenColumnValues.find(
          (v) => v.key === filter.name
        );
        if (matchingValue) {
          if (filter.name === baseColumnName) {
            if (isFromReference) {
              filter.value_from = matchingValue.value;
            } else if (isToReference) {
              filter.value_to = matchingValue.value;
            }
          }
        }
      }
    );
    // Update the search list state with a new array
    this.searchList.set([...updatedFilters]);
    this.searchListChanged.emit(this.searchList());
  }

  async getLastConditionSettingData(): Promise<void> {
    const lastConditionSettingData =
      await this.dispCondSettingService.getLastConditionSetting(
        this.userId(),
        this.formID(),
        this.searchList()
      );
    if (lastConditionSettingData && lastConditionSettingData.length > 0) {
      this.searchList.set(lastConditionSettingData);
    }
  }

  //This function toggles all checkboxes on or off according to the state of the 'すべて' (Select All) checkbox
  onAllCheckboxChange(column: FILTER, memberCode: string): void {
    if (memberCode === 'ALL') {
      const checkboxId = `${column.name}_ALL`;
      const checkboxElement = document.getElementById(
        checkboxId
      ) as HTMLInputElement;
      const isChecked = checkboxElement?.checked;

      if (!isChecked) {
        // Uncheck all by filtering out all members of this column
        column.value_from = (column.value_from as string[]).filter(
          (code) =>
            !(column.memberList ?? []).some((member) => member.code === code)
        );
      } else {
        // Check all by adding all member codes not already present
        column.value_from = (column.memberList ?? []).map(
          (member) => member.code
        );
      }
    } else {
      // Handle individual checkbox changes
      const allChecked = (column.memberList ?? [])
        .filter((member) => member.code !== 'ALL')
        .every((member) =>
          (column.value_from as string[]).includes(member.code)
        );

      // Update the state of the 'すべて' (Select All) checkbox
      this.allCheckedStates[column.name] = allChecked;
    }
  }
}
