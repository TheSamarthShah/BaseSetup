import { Component, effect, inject, input, OnChanges, output, SimpleChanges } from '@angular/core';
import { Button } from '../button/button';
import { refScreenColumns } from 'src/core/models/refScreenColumns.type';
import { ReferenceScreenService } from 'src/core/services/reference-screen-service';

@Component({
  selector: 'acty-reference-screen-button',
  imports: [Button],
  templateUrl: './reference-screen-button.html',
  styleUrl: './reference-screen-button.scss'
})
export class ReferenceScreenButton implements OnChanges {
  refScreenService = inject(ReferenceScreenService);

  // Inputs
  refTableName = input.required<string>();
  queryID = input<string>();
  refTitleCaption = input.required<string>();
  formId = input.required<string>();
  userId = input.required<string>();
  refColumns = input.required<refScreenColumns[]>();
  refForColumn = input.required<string>();
  selectedValue = input<string | string[] | any>();
  // if the column name with its value is given then it'll use it every time. The value comes from form.
  defaultValue = input<{ [key: string]: any }>({});
  rowId = input<number>(-1);
  // use when multiple grids in same form to avoid emit propogation (specially for toroku forms)
  gridId = input<string>('');
  isBackgroundLoading = input<boolean>();
  disabled = input<boolean>();
  gridRefData = input<{
    refTableName: string;
    queryID: string;
    refColumns: refScreenColumns[];
    rowId: number;
    gridId?: string;
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
    gridId: string;
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
          gridId: '',
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
      refTableName: this.refTableName(),
      queryID: this.queryID() ?? '',
      refTitleCaption: this.refTitleCaption(),
      formId: this.formId(),
      userId : this.userId(),
      refColumns: this.refColumns(),
      refForColumn: this.refForColumn(),
      selectedValue: this.selectedValue() ?? '',
      defaultValue: this.defaultValue() ?? {},
      rowId: this.rowId(),
      gridId: this.gridId(),
      gridRefData: this.gridRefData() ?? null,
    });
    setTimeout(() => {
      this.refScreenService.showRefScreen();
    }, 10);
  }
}
