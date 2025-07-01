import {
  Component,
  effect,
  inject,
  input,
  OnChanges,
  output,
  SimpleChanges,
} from '@angular/core';
import { refScreenColumns } from '../../../model/core/refScreenColumns.type';
import { ButtonModule } from 'primeng/button';
import { ReferenceScreenService } from '../../../services/core/reference-screen.service';

@Component({
  selector: 'app-reference-screen-button',
  templateUrl: './reference-screen-button.component.html',
  styleUrl: './reference-screen-button.component.scss',
  imports: [ButtonModule],
})
export class ReferenceScreenButtonComponent implements OnChanges {
  refScreenService = inject(ReferenceScreenService);

  // Inputs
  tableName = input.required<string>();
  queryID = input<string>();
  tableJPName = input.required<string>();
  formId = input.required<string>();
  columns = input.required<refScreenColumns[]>();
  refForColumn = input.required<string>();
  selectedValue = input<string | string[]>();
  // if the column name with its value is given then it'll use it every time. The value comes from form.
  defaultValue = input<{ [key: string]: any }>({});
  rowId = input<number>(-1);
  isBackgroundLoading = input<boolean>();
  disabled = input<boolean>();
  gridRefData = input<{
    tableName: string;
    queryID: string;
    columns: refScreenColumns[];
    rowId: number;
    refForColumn: string;
    selectedValue: string | string[];
    defaultValue: { [key: string]: any };
  }>();

  // Outputs
  referenceSelected = output<{
    refForColumn: string;
    selectedValue: string;
    mainScreenColumnValues: { key: string; value: string }[];
    rowId: number;
  }>();

  constructor() {
    effect(async () => {
      /**
       * If referenceSelected in service is changed and its refForColumn is not empty string then some value is selected so emit that value so it can be set.
       */
      if (this.refScreenService.referenceSelected().refForColumn != '') {
        await this.referenceSelected.emit(
          this.refScreenService.referenceSelected()
        );
        // After emiting reset the value in service
        this.refScreenService.referenceSelected.set({
          refForColumn: '',
          selectedValue: '',
          mainScreenColumnValues: [],
          rowId: -1,
        });
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // gridRefData is used to get ref data without opening the dialog so when its input is changed update it in service
    if (changes['gridRefData']) {
      this.refScreenService.gridRefData.set(this.gridRefData() ?? null);
    }
  }

  showDialog(): void {
    this.refScreenService.updateReferenceData({
      tableName: this.tableName(),
      queryID: this.queryID() ?? '',
      tableJPName: this.tableJPName(),
      formId: this.formId(),
      columns: this.columns(),
      refForColumn: this.refForColumn(),
      selectedValue: this.selectedValue() ?? '',
      defaultValue: this.defaultValue() ?? {},
      rowId: this.rowId(),
      gridRefData: this.gridRefData() ?? null,
    });
    setTimeout(() => {
      this.refScreenService.showRefScreen();
    }, 10);
  }
}
