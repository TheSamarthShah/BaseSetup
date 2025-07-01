import {
  Component,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TABLE_OPTIONS } from '../../../shared/jp-text';
import { SwapColumn } from '../../../model/core/swapColumn.type';
import { FILTER } from '../../../model/core/filter.type';
import { SaveAsService } from '../../../services/core/export.service';
import { gridColumnHeader } from '../../../model/core/gridColumnHeader.type';
import { changesReturn } from '../../../model/core/confirm-changes-guard-props.type';
import { SaveAsComponent } from '../export/export.component';
import { SortDataComponent } from '../sort-data/sort-data.component';
import { SwapColumnsComponent } from '../swap-columns/swap-columns.component';

@Component({
  selector: 'app-table-options',
  imports: [
    ButtonModule,
    MenuModule,
    SaveAsComponent,
    SortDataComponent,
    SwapColumnsComponent,
  ],
  templateUrl: './table-options.component.html',
  styleUrl: './table-options.component.scss',
})
export class TableOptionsComponent implements OnChanges {
  //for exporting files
  exportFileService = inject(SaveAsService);

  // Inputs
  userId = input.required<string>();
  exportData = input<Array<FILTER>>([]);
  gridColumnList = input<Array<gridColumnHeader>>([]);
  gridColumnListAll = input<Array<gridColumnHeader>>([]);
  exportURL = input<string>('');
  formId = input.required<string>();
  isBackgroundLoading = input<boolean>(false);
  confirmGridChanges = input<() => Promise<changesReturn>>();
  // Inputs for visiblility of functionallities
  showExport = input.required<boolean>();
  showSortData = input.required<boolean>();
  showSwapCol = input.required<boolean>();

  // Outputs
  isLoading = output<boolean>();
  swapDataUpdated = output<Array<SwapColumn>>();
  sortDataChnaged = output();
  getDataTrigger = output<boolean>();

  tableOptionsLbl: string = TABLE_OPTIONS.TITLE;
  // Menu items for dropdown with Bootstrap icons
  menuItems: Array<any> = [];

  childComponent = signal('');
  // Store the selected component name
  selectedComponent = signal<string | null>(null);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showExport'] && this.showExport()) {
      this.menuItems.push({
        label: TABLE_OPTIONS.EXPORT,
        value: 'export',
        icon: 'pi pi-file-export',
        command: () => this.openSaveAs(),
      });
    }

    if (changes['showSortData'] && this.showSortData()) {
      this.menuItems.push({
        label: TABLE_OPTIONS.SORT_DATA,
        value: 'sortData',
        icon: 'pi pi-sort-alt',
        command: async () => {
          const confirmFn = this.confirmGridChanges?.();
          if (confirmFn) {
            const result = await confirmFn();
            if (!result.proceed) return; // CANCEL case
            if (result.hasChanges) {
              this.getDataTrigger.emit(true);
            }
          }
          this.openSortData();
        },
      });
    }

    if (changes['showSwapCol'] && this.showSwapCol()) {
      this.menuItems.push({
        label: TABLE_OPTIONS.SWAP_COLUMNS,
        value: 'swapColumns',
        icon: 'pi pi-sync',
        command: () => this.openSwapColumn(),
      });
    }
  }

  openSaveAs(): void {
    this.childComponent.set('1');
  }

  openSortData(): void {
    this.childComponent.set('2');
  }

  openSwapColumn(): void {
    this.childComponent.set('3');
  }

  saveAsClosed(): void {
    this.childComponent.set('');
  }

  closeSortData(): void {
    this.childComponent.set('');
  }

  closeSwapColumn(): void {
    this.childComponent.set('');
  }

  onSwapDataUpdate(newSwapData: Array<SwapColumn>): void {
    this.swapDataUpdated.emit(newSwapData);
  }

  onSortDataChange(): void {
    this.sortDataChnaged.emit();
  }

  isLoadingChange(isLoadingState: boolean): void {
    this.isLoading.emit(isLoadingState);
  }
}
