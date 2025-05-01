import {
  Component,
  effect,
  input,
  output,
  signal,
  SimpleChanges,
  inject,
  booleanAttribute,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputText } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DatePicker } from 'primeng/datepicker';
import { SelectModule } from 'primeng/select';
import { JPTEXT } from '../../../shared/constants/jp-text';
import { FILTER } from '../../../model/core/filter.type';
import { Checkbox } from 'primeng/checkbox';
import { ConditionSettingsComponent } from '../condition-settings/condition-settings.component';
import { AutomaticAdjustmentService } from '../../../services/core/automatic-adjustment.service';
import { MaxLengthDirective } from '../../../directives/max-length.directive';
import { ReferenceScreenButtonComponent } from '../reference-screen-button/reference-screen-button.component';
import { gridChangesReturn } from '../../../model/shared/grid-changes-guard.type';

@Component({
  selector: 'app-filter',
  imports: [
    InputText,
    SelectModule,
    FormsModule,
    Checkbox,
    DatePicker,
    ConditionSettingsComponent,
    ReferenceScreenButtonComponent,
    InputNumberModule,
    MaxLengthDirective,
  ],
  templateUrl: './filter.component.html',
  styleUrl: './filter.component.scss',
})
export class FilterComponent {
  formID = input.required<string>();
  filter_title = input.required();
  conditionAdjustmentKBNInp = input.required<string>();
  searchListInput = input.required<Array<FILTER>>();
  updateScrollHeight = input();
  showConditionSetting = input(true);
  isBackGroundOn = input<boolean>();
  confirmGridChanges = input<() => Promise<gridChangesReturn>>();

  getDataTriggered = output<boolean>();
  searchListChanged = output<Array<FILTER>>();

  conditionAdjustmentKBN = signal<string>('');
  searchList = signal<Array<FILTER>>([]); // Start with an empty array
  // to show increament by 1 this.isLoading.update((n) => n + 1);
  // to hide decreament by 1 till 0 this.isLoading.update((n) => Math.max(n - 1, 0));
  isLoading = signal<number>(0); //variable for managing loader

  //for making API calls
  service = inject(AutomaticAdjustmentService);

  ngOnChanges(changes: SimpleChanges) {
    if (changes['searchListInput']) {
      this.searchList.set(this.searchListInput());
    }

    if (changes['conditionAdjustmentKBNInp']) {
      this.conditionAdjustmentKBN.set(this.conditionAdjustmentKBNInp());
    }
  }

  constructor() {
    //effect to update searchList when searchListInput Changes
    effect(() => {
      if (this.searchListInput()) {
        this.searchList.set(this.searchListInput());
      }
    });
  }

  //variable for all the texts stored in constants
  textContent = signal(JPTEXT);

  match_options_string = signal([
    { key: '1', value: this.textContent().MATCH_CONDITIONS.range },
    { key: '2', value: this.textContent().MATCH_CONDITIONS.equals },
    { key: '3', value: this.textContent().MATCH_CONDITIONS.notEquals },
    { key: '4', value: this.textContent().MATCH_CONDITIONS.startsWith },
    { key: '5', value: this.textContent().MATCH_CONDITIONS.notStartsWith },
    { key: '6', value: this.textContent().MATCH_CONDITIONS.endsWith },
    { key: '7', value: this.textContent().MATCH_CONDITIONS.notEndsWith },
    { key: '8', value: this.textContent().MATCH_CONDITIONS.contains },
    { key: '9', value: this.textContent().MATCH_CONDITIONS.notContains },
    { key: '10', value: this.textContent().MATCH_CONDITIONS.isNull },
    { key: '11', value: this.textContent().MATCH_CONDITIONS.isNotNull },
  ]);

  match_options_number = signal([
    { key: '1', value: this.textContent().MATCH_CONDITIONS.range },
    { key: '2', value: this.textContent().MATCH_CONDITIONS.equals },
    { key: '3', value: this.textContent().MATCH_CONDITIONS.notEquals },
    { key: '10', value: this.textContent().MATCH_CONDITIONS.isNull },
    { key: '11', value: this.textContent().MATCH_CONDITIONS.isNotNull },
  ]);

  //for show/hide filter tab
  isShowFilter = signal<boolean>(true);

  toggleFilter() {
    this.isShowFilter.set(!this.isShowFilter());
    this.updateScrollHeight();
  }

  getData() {
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

    if (this.searchList().find((d) => d.invalidInput)) return;

    //This condition is for the when the data is search that time the filter tab should be hidden or shown
    if (this.conditionAdjustmentKBN() === '1') {
      this.toggleFilter();
    }

    this.getDataTriggered.emit(false);
  }

  resetFilter() {
    this.searchList.set(
      this.searchList().map((data) => ({
        ...data,
        value_from:
          data.data_type === '4' && data.memberList
            ? data.memberList?.map((m) => m.key).join(',')
            : '',
        value_to: '',
        match_type: data.data_type === '1' ? '4' : '1',
        invalidInput: false,
      }))
    );

    this.searchListChanged.emit(this.searchList());
  }

  OnInputEvent(name: string) {
    const inputEle = this.searchList().find((l) => l.name === name);
    if (inputEle) {
      inputEle.invalidInput = false;
    }
  }

  onReferenceSelected(event: {
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
  }) {
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
          } else {
            filter.value_from = matchingValue.value;
          }
        }
      }
    );

    // Update the search list state with a new array
    this.searchList.set([...updatedFilters]);

    this.searchListChanged.emit(this.searchList());
  }

  conditionSettingsLoad(searchCols: Array<FILTER>) {
    this.searchList.set(searchCols);
    this.updateScrollHeight();
    this.searchListChanged.emit(this.searchList());
    this.getData();
  }

  conditionAdjustmentKBNChanged(adjustmentKBN: string) {
    this.conditionAdjustmentKBN.set(adjustmentKBN);
  }

  onGetDataTriggered(event: boolean){
    this.getDataTriggered.emit(event);
  }
}
