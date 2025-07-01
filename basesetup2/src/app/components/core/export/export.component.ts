import {
  Component,
  input,
  signal,
  output,
  SimpleChanges,
  inject,
  OnChanges,
} from '@angular/core';
import { Dialog } from 'primeng/dialog';
import { SaveAsService } from '../../../services/core/export.service';
import { FormsModule } from '@angular/forms';
import { FILTER } from '../../../model/core/filter.type';
import { ERRMSG } from '../../../shared/messages';
import { EXPORT, TABLE_OPTIONS } from '../../../shared/jp-text';
import { SelectModule } from 'primeng/select';
import { InputText } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { gridColumnHeader } from '../../../model/core/gridColumnHeader.type';
import { MessageModule } from 'primeng/message';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-export',
  imports: [
    Dialog,
    FormsModule,
    ButtonModule,
    SelectModule,
    InputText,
    MessageModule,
    ToastModule,
  ],
  templateUrl: './export.component.html',
  styleUrl: './export.component.scss',
})
export class SaveAsComponent implements OnChanges {
  //services injection
  exportFileService = inject(SaveAsService); //for exporting files

  //inputs
  exportURL = input<string>('');
  exportData = input<Array<FILTER>>([]);
  gridColumnList = input<Array<gridColumnHeader>>([]);
  displayInp = input<boolean>(false); //flag to manage hide and show of popup
  formId = input.required<string>();
  userId = input.required<string>();
  //outputs
  closeTriggered = output();
  isLoading = output<boolean>();

  textExportContent: any = EXPORT;
  errMsgs: any = ERRMSG;
  tableOptionsContent: any = TABLE_OPTIONS;
  File_options: any = [
    { name: '.csv', code: '.csv' },
    { name: '.txt', code: '.txt' },
  ];
  fileName: string = this.textExportContent.DEFAULT_FILE_NAME;
  fileType: string = '.csv'; // Default value

  displayFlg = signal(false);
  isInvalidFileName = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayInp']) {
      this.displayFlg.set(this.displayInp());
    }
  }

  //This faction is used to close the popup
  closeModel(): void {
    this.displayFlg.set(false);
    this.closeTriggered.emit();
  }

  // Method to get current values
  getFileData(): {
    name: string;
    type: string;
    fullName: string;
  } {
    return {
      name: this.fileName,
      type: this.fileType,
      fullName: this.fileName + this.fileType,
    };
  }

  checkFileName(): boolean {
    if (this.fileName === '' || this.fileName === null) {
      return true;
    }
    return false;
  }

  OnFileNameInputEvent(): void {
    this.isInvalidFileName.set(false);
  }

  //This function is use to export the data to a csv file
  exportFile(): void {
    this.isInvalidFileName.set(this.checkFileName());
    if (this.isInvalidFileName() == false) {
      this.isLoading.emit(true);
      this.exportFileService
        .exportData(
          this.exportData(),
          this.gridColumnList(),
          this.fileType,
          this.exportURL(),
          this.userId(),
          this.formId()
        )
        .subscribe({
          next: (res) => {
            // Create download link
            const url = window.URL.createObjectURL(res);
            const a = document.createElement('a');
            this.isLoading.emit(false);
            this.closeModel();

            a.href = url;
            a.download = this.getFileData().fullName;
            document.body.appendChild(a);
            a.click();
            // Clean up
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
          },
          error: (err) => {
            this.isLoading.emit(false);
            this.closeModel();
          },
        });
    }
  }
}
