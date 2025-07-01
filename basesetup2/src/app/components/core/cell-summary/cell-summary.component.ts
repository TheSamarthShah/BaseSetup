import {
  Component,
  input,
  output,
  signal,
  computed,
  effect,
  Signal,
  ViewChild,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CellSummaryOutputComponent } from '../cell-summary-output/cell-summary-output.component';
import { CELL_SELECTION } from '../../../shared/jp-text';
import { ButtonModule } from 'primeng/button';
import { Popover } from 'primeng/popover';
import { PopoverModule } from 'primeng/popover';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-cell-summary',
  imports: [
    CommonModule,
    FormsModule,
    CellSummaryOutputComponent,
    ButtonModule,
    PopoverModule,
    CheckboxModule,
  ],
  templateUrl: './cell-summary.component.html',
  styleUrl: './cell-summary.component.scss',
})
export class CellSummaryComponent {
  @ViewChild('op') op!: Popover;

  selectedValues = input<{ value: any; dataType: string }[]>([]);

  summaryChanged = output<{
    options: any[];
    isCellModeEnabled: boolean;
    computedValues: Record<string, string>;
  }>();

  CellSelectionText: any = CELL_SELECTION;

  //list of selected options
  selectedOptions = signal<any[]>([]);
  //list of avaialble options
  _options = signal([
    {
      label: this.CellSelectionText.CELL_MODE,
      value: 'col0',
      checked: false,
      isOnlyForNumbers: false,
      isShow: true,
    },
    {
      label: this.CellSelectionText.AVERAGE,
      value: 'col1',
      checked: true,
      isOnlyForNumbers: true,
      isShow: false,
    },
    {
      label: this.CellSelectionText.NUM_DATA,
      value: 'col2',
      checked: true,
      isOnlyForNumbers: false,
      isShow: false,
    },
    {
      label: this.CellSelectionText.NUM_VALUES,
      value: 'col3',
      checked: true,
      isOnlyForNumbers: true,
      isShow: false,
    },
    {
      label: this.CellSelectionText.MIN,
      value: 'col4',
      checked: true,
      isOnlyForNumbers: true,
      isShow: false,
    },
    {
      label: this.CellSelectionText.MAX,
      value: 'col5',
      checked: true,
      isOnlyForNumbers: true,
      isShow: false,
    },
    {
      label: this.CellSelectionText.SUM,
      value: 'col6',
      checked: true,
      isOnlyForNumbers: true,
      isShow: false,
    },
  ]);

  isCellModeEnabled: Signal<boolean> = computed(
    () => this._options().find((opt) => opt.value === 'col0')?.checked ?? false
  );
  computedValues: Signal<{
    col1: string;
    col2: string;
    col3: string;
    col4: string;
    col5: string;
    col6: string;
  }> = computed(() => {
    const values = this.selectedValues();
    const numericValues = values
      .filter((v) => v.dataType === '2' && v.value !== null)
      .map((v) => Number(v.value));

    const numericCount = values.filter((v) => v.dataType === '2').length;

    return {
      col1:
        numericCount > 0
          ? this.formatNumber(
              numericValues.reduce((sum, num) => sum + num, 0) / numericCount
            )
          : '',
      col2: values.length.toString(),
      col3: values
        .filter((v) => v.value !== null && v.value !== undefined)
        .length.toString(),
      col4:
        numericValues.length > 0
          ? this.formatNumber(Math.min(...numericValues))
          : '',
      col5:
        numericValues.length > 0
          ? this.formatNumber(Math.max(...numericValues))
          : '',
      col6: this.formatNumber(numericValues.reduce((sum, num) => sum + num, 0)),
    };
  });

  constructor() {
    effect(() => {
      this.updateShowFlags();
      this.summaryChanged.emit({
        options: this._options(),
        isCellModeEnabled: this.isCellModeEnabled(),
        computedValues: this.computedValues(),
      });
      this.selectedOptions.set(this._options().filter((opt) => opt.checked));
    });
  }

  toggle(event: any) {
    this.op.toggle(event);
  }

  onCheckboxChange(event: Event, option: any): void {
    const isChecked = (event.target as HTMLInputElement).checked;

    this._options.update((options) =>
      options.map((opt) =>
        opt.value === option.value ? { ...opt, checked: isChecked } : opt
      )
    );

    this.selectedOptions.set(this._options().filter((opt) => opt.checked));

    this.updateShowFlags();

    this.summaryChanged.emit({
      options: this._options(),
      isCellModeEnabled: this.isCellModeEnabled(),
      computedValues: this.computedValues(),
    });
  }

  private formatNumber(num: number): string {
    return num % 1 === 0 ? num.toString() : num.toFixed(2);
  }

  onModelChange(selected: any[]): void {
    this._options.update((options) =>
      options.map((opt) => ({
        ...opt,
        checked: selected.some((s) => s.value === opt.value),
      }))
    );
    this.updateShowFlags();
  }

  private updateShowFlags(): void {
    const values = this.selectedValues();
    const hasNumericValues = values.some((v) => v.dataType === '2');
    const moreThanOneSelected = values.length > 1;

    this._options.update((options) =>
      options.map((opt) => ({
        ...opt,
        isShow: moreThanOneSelected
          ? opt.isOnlyForNumbers
            ? hasNumericValues
            : true
          : false,
      }))
    );
  }
}
