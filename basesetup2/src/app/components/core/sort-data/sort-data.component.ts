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
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { gridColumnHeader } from '../../../model/core/gridColumnHeader.type';
import { MessageService } from 'primeng/api';
import { SortDataService } from '../../../services/core/sort-data.service';
import { INFOMSG, SUCCESSMSG } from '../../../shared/messages';
import { SORT_DATA } from '../../../shared/jp-text';
import { SelectModule } from 'primeng/select';
import { FormsModule } from '@angular/forms';
import { RadioButtonModule } from 'primeng/radiobutton';

@Component({
  selector: 'app-sort-data',
  imports: [
    DialogModule,
    ButtonModule,
    SelectModule,
    FormsModule,
    RadioButtonModule,
  ],
  templateUrl: './sort-data.component.html',
  styleUrl: './sort-data.component.scss',
})
export class SortDataComponent implements OnInit, OnChanges {
  sortDataService = inject(SortDataService);
  //for displaying Toast messages
  messageService = inject(MessageService);

  // Inputs
  displayDialogInp = input.required<boolean>();
  sortOptionsInp = input.required<gridColumnHeader[]>(); // Input as gridColumnHeader[]
  formId = input.required<string>();
  userId = input.required<string>();

  // Outputs
  isLoading = output<boolean>();
  sortDataChanged = output();
  closeSortDataTrigger = output();

  textContent: any = SORT_DATA;
  sortOptions: gridColumnHeader[] = []; // Transformed list
  initialSortingData: {
    UserId: any;
    FormId: string;
    Columns: {
      SortSeq: string;
      SortColumn: string;
      SortType: string;
    }[];
  } = {
    UserId: '',
    FormId: '',
    Columns: Array.from({ length: 5 }, (_, i) => ({
      SortSeq: (i + 1).toString(),
      SortColumn: '',
      SortType: '0',
    })),
  };

  displayDialog = signal<boolean>(false);
  sortingData = signal<{
    UserId: any;
    FormId: string;
    Columns: {
      SortSeq: string;
      SortColumn: string;
      SortType: string;
    }[];
  }>({
    UserId: '',
    FormId: '',
    Columns: Array.from({ length: 5 }, (_, i) => ({
      SortSeq: (i + 1).toString(),
      SortColumn: '',
      SortType: '0',
    })),
  });

  ngOnInit(): void {
    this.getSort();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayDialogInp']) {
      this.displayDialog.set(this.displayDialogInp());
    }

    if (changes['sortOptionsInp']) {
      this.sortOptions = this.sortOptionsInp().map((option) => ({
        name: option.name,
        displayName: option.displayName,
        dataType: option.dataType,
      }));
    }

    if (changes['formId']) {
      // Update sortingData when formId is available
      this.sortingData.set({
        ...this.sortingData(),
        FormId: this.formId(),
      });
      this.initialSortingData = {
        ...this.initialSortingData,
        FormId: this.formId(),
      };
    }

    if (changes['userId']) {
      // Update sortingData when userId is available
      this.sortingData.set({
        ...this.sortingData(),
        UserId: this.userId(),
      });
      this.initialSortingData = {
        ...this.initialSortingData,
        UserId: this.userId(),
      };
    }
  }

  showDialog(): void {
    this.displayDialog.set(true);
  }

  onDialogClose(): void {
    this.displayDialog.set(false);
    this.closeSortDataTrigger.emit();
  }

  getSort(): void {
    this.sortDataService
      .getSortingData(
        this.sortingData().UserId ?? '',
        this.sortingData().FormId ?? ''
      )
      .subscribe({
        next: (res) => {
          if (res.Code === 200) {
            this.sortingData.set(
              JSON.parse(JSON.stringify(res.Data.SortingData))
            );
            this.initialSortingData = JSON.parse(
              JSON.stringify(res.Data.SortingData)
            );
          }
        },
      });
  }

  // resets the sorting to common default settings
  resetSort(): void {
    this.sortingData.set({
      UserId: this.userId(),
      FormId: this.formId(),
      Columns: Array.from({ length: 5 }, (_, i) => ({
        SortSeq: (i + 1).toString(),
        SortColumn: '',
        SortType: '0',
      })),
    });
  }

  private hasSortingDataChanged(): boolean {
    return (
      JSON.stringify(this.sortingData()) !==
      JSON.stringify(this.initialSortingData)
    );
  }

  // save the sortring data if it is changed
  applySort(): void {
    if (!this.hasSortingDataChanged()) {
      this.messageService.add({
        severity: 'info',
        summary: INFOMSG.I0002,
      });
      return;
    }

    this.isLoading.emit(true);
    this.sortDataService.saveSortingData(this.sortingData()).subscribe({
      next: (data) => {
        if (data.Code === 200) {
          this.messageService.add({
            severity: 'success',
            summary: SUCCESSMSG.S0001,
          });
          this.sortDataChanged.emit();
          this.displayDialog.set(false);
        }
        this.isLoading.emit(false);
      },
      error: (err) => {
        this.isLoading.emit(false);
      },
    });
  }
}
