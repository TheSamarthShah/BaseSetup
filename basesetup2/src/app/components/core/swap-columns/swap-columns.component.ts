import {
  Component,
  signal,
  HostListener,
  input,
  output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { SWAP_COLUMNS } from '../../../shared/jp-text';
import { Checkbox } from 'primeng/checkbox';
import { TableModule } from 'primeng/table';
import { gridColumnHeader } from '../../../model/core/gridColumnHeader.type';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { SwapColumn } from '../../../model/core/swapColumn.type';
import { SwapColumnService } from '../../../services/core/swap-column.service';
import { MessageService } from 'primeng/api';
import { SUCCESSMSG } from '../../../shared/messages';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CookieService } from 'ngx-cookie-service';
import { ButtonModule } from 'primeng/button';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-swap-columns',
  imports: [
    Dialog,
    FormsModule,
    CommonModule,
    ButtonModule,
    TableModule,
    DragDropModule,
    Checkbox,
  ],
  templateUrl: './swap-columns.component.html',
  styleUrl: './swap-columns.component.scss',
})
export class SwapColumnsComponent {
  //services
  service = inject(SwapColumnService); //for making API calls
  messageService = inject(MessageService); //for displaying Toast messages
  cookieService = inject(CookieService);

  //inputs
  userId = input.required<string>();
  formId = input.required<string>();
  displayInp = input<boolean>(false); //flag to manage hide and show of popup
  gridColumnList = input<Array<gridColumnHeader>>([]);

  //outputs
  closeTriggered = output();
  swapDataUpdated = output<Array<SwapColumn>>();
  isLoading = output<boolean>();

  textContent: any = SWAP_COLUMNS;
  checked: boolean = false;
  newGridColumnList: Array<SwapColumn> = [];
  arrangedGridColumnList: Array<any> = [];
  swapData: SwapColumn[] = [];

  displayFlg = signal(false);
  gridColumnList2 = signal<Array<SwapColumn>>([]);

  @HostListener('window:resize')
  onResize(): void {
    this.updateSwapScrollHeight();
  }

  ngOnInit(): void {
    this.getSwapData();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayInp']) {
      this.displayFlg.set(this.displayInp());
    }
  }

  ngAfterViewInit(): void {
    this.updateSwapScrollHeight();
  }

  async getSwapData(): Promise<void> {
    const userId = this.userId();
    const formId = this.formId();
    this.isLoading.emit(true);
    this.swapData = await this.service.getSwapDataOfForm(userId, formId);
    if (this.swapData.length > 0) {
      this.arrangGridDisplay();
      for (let i = 0; i < this.arrangedGridColumnList.length; i++) {
        const matchedColumn = this.swapData.find(
          (swapDataItem) =>
            swapDataItem.COLNM === this.arrangedGridColumnList[i].name
        );

        if (matchedColumn) {
          const newItem = {
            ...matchedColumn,
            _DISPLAYNAME: this.arrangedGridColumnList[i].displayName,
            _FROZEN: matchedColumn.FROZEN === 1,
            _VISIBLE: matchedColumn.VISIBLE === 1,
          };
          this.gridColumnList2().push(newItem);
        } else {
          this.newGridColumnList.push({
            USERID: this.userId(),
            FORMID: this.formId(),
            _DISPLAYNAME: this.arrangedGridColumnList[i].displayName,
            COLNM: this.arrangedGridColumnList[i].name,
            VISIBLE: 1,
            _VISIBLE: true,
            FROZEN: 0,
            _FROZEN: false,
            COLNO: i,
            DISPCOLNO: i,
          });
        }
      }

      // Get current length of gridColumnList2 this is existing columns
      const maxColumnLength = this.gridColumnList2().length;

      //update COLNO of newGridColumnList
      this.newGridColumnList.map((item, index) => {
        item.COLNO = maxColumnLength + index;
        return item;
      });

      //add new columns to the gridColumnList2 at the last position
      this.gridColumnList2().push(...this.newGridColumnList);
    } else {
      //if the no data found then take initial value base on the grid display
      for (let i = 0; i < this.gridColumnList().length; i++) {
        this.gridColumnList2().push({
          USERID: this.userId(),
          FORMID: this.formId(),
          _DISPLAYNAME: this.gridColumnList()[i].displayName,
          COLNM: this.gridColumnList()[i].name,
          VISIBLE: 1,
          _VISIBLE: true,
          FROZEN: 0,
          _FROZEN: false,
          COLNO: i,
          DISPCOLNO: i,
        });
      }
    }
    this.isLoading.emit(false);
  }

  onDisplayCheckboxChange(rowData: any, field: string, event: boolean): void {
    rowData[field] = event ? 1 : 0;
  }

  saveData(): void {
    for (let i = 0; i < this.gridColumnList2().length; i++) {
      this.gridColumnList2()[i].DISPCOLNO = i;
    }
    this.isLoading.emit(true);
    //save data to database using API
    this.service.savechanges(this.formId(), this.gridColumnList2()).subscribe({
      next: (res) => {
        if (res.Code === 200) {
          this.messageService.add({
            severity: 'success',
            summary: SUCCESSMSG.S0001,
          });
          this.swapDataUpdated.emit(this.gridColumnList2());
        }
        this.isLoading.emit(false);
        this.closeModel();
      },
      error: (err) => {
        this.isLoading.emit(false);
      },
    });
  }

  resetData(): void {
    this.gridColumnList2().forEach((col: any) => {
      col.VISIBLE = 1;
      col.FROZEN = 0;
      col._VISIBLE = true;
      col._FROZEN = false;
    });

    this.gridColumnList2().sort((a: any, b: any) => a.COLNO - b.COLNO);
  }

  closeModel(): void {
    this.displayFlg.set(false);
    this.closeTriggered.emit();
  }

  onDialogResize(event: any): void {
    this.updateSwapScrollHeight();
  }

  /**
   * fills up the remaining height of the screen with the grid by setting its height with that much px
   * @returns
   */
  updateSwapScrollHeight(): void {
    const dataDiv: HTMLElement = document.querySelector(
      '.swapDataDiv'
    ) as HTMLElement;
    if (!dataDiv) return;

    const availableHeight: number = dataDiv.clientHeight;

    const tableContainer: HTMLElement = dataDiv.querySelector(
      '.p-datatable-table-container'
    ) as HTMLElement;
    if (tableContainer) {
      tableContainer.style.height = `${availableHeight}px`;
      tableContainer.style.maxHeight = `${availableHeight}px`;
      tableContainer.style.paddingTop = '2px';
    }
  }

  arrangGridDisplay(): void {
    // Update this.dataGrid based on swapData
    const updatedGrid = this.gridColumnList().map((gridItem) => {
      const swapItem = this.swapData.find(
        (swap) => swap.COLNM === gridItem.name
      );

      return swapItem
        ? {
            ...gridItem,
            displaySeq: swapItem.DISPCOLNO,
            frozen: swapItem.FROZEN === 1, // Convert number to boolean
            visible: swapItem.VISIBLE === 1, // Convert number to boolean
          }
        : gridItem;
    });

    // Sort with frozen columns first (sorted by displaySeq), then others (sorted by displaySeq)
    updatedGrid.sort((a, b) => {
      // Use type assertion to access 'frozen' property if it exists, otherwise default to false
      const aFrozen = (a as any).frozen ?? false;
      const bFrozen = (b as any).frozen ?? false;

      // If one is frozen and the other isn't, frozen comes first
      if (aFrozen && !bFrozen) return -1;
      if (!aFrozen && bFrozen) return 1;

      // If both are frozen or both non-frozen, sort by displaySeq
      return ((a as any).displaySeq ?? 0) - ((b as any).displaySeq ?? 0);
    });

    this.arrangedGridColumnList = updatedGrid;
  }
}
