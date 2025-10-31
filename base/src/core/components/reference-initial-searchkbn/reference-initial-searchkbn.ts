import { Component, inject, input, NgZone, OnInit, output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { DialogBox } from "../dialogbox/dialogbox";
import { Button } from '../button/button';
import { RadioButton } from "../radiobutton/radiobutton";
import { ReferenceSettingsService } from 'src/core/services/reference-settings-service';
import { FormControl, FormGroup } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { firstValueFrom, take } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'acty-reference-initial-searchkbn',
  imports: [DialogBox, Button, RadioButton, CommonModule, ReactiveFormsModule,TranslateModule],
  templateUrl: './reference-initial-searchkbn.html',
  styleUrl: './reference-initial-searchkbn.scss'
})
export class ReferenceInitialSearchkbn {
  @ViewChild('RefScreen') dialogBox!: DialogBox;
  referenceSettingsService = inject(ReferenceSettingsService);
  ngZone = inject(NgZone);


  //input
  formId = input.required<string>();
  refTableName = input.required<string>();
  userId = input.required<string>();
  displayFlgInp = input<boolean>(false);

  //output
  dialogClose = output<boolean>();

  //signal
  initial_searchKBN = signal<'1' | '2'>('1'); // 1 for yes and 2 for no

  ReferencesKbns = new FormGroup({
    ReferencesSettingskbn: new FormControl<number | null>(null),
  });

  onCloseDialog() {
    this.dialogClose.emit(false);
  }

  async openDialg() {
    await firstValueFrom(this.ngZone.onStable.pipe(take(1)));
    this.dialogBox.openDialog()
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayFlgInp']) {
      if (this.displayFlgInp() === true)
        this.openDialg()
    }
  }

  saveData(): void {
    let getReferencesKbn = this.ReferencesKbns?.value?.ReferencesSettingskbn ? this.ReferencesKbns.value.ReferencesSettingskbn : 0
    const data = {
      UserId: this.userId(),
      FormId: this.formId(),
      TableName: this.refTableName(),
      InitialSearchKBN: getReferencesKbn.toString(),
    };
    this.referenceSettingsService.saveReferenceSetting(data).subscribe({
      next: (res) => {
        if (res.Code === 200) {
          // this.messageService.add({
          //   severity: 'success',
          //   summary: SUCCESSMSG.S0001,
          // });
        }
      },
    });
    this.dialogClose.emit(false);
  }

  /**
   * The data will be fetched when the reference screen dialog opens(Method is used in reference screen component).
   * If the data is found then update the main kbn variable this.initial_searchKBN() with it else assing '1'
   * @returns the initial search kbn value
   */
  getData(): Promise<string> {
    const data = {
      UserId: this.userId(),
      FormId: this.formId(),
      TableName: this.refTableName(),
    };
    return new Promise((resolve, reject) => {
      this.referenceSettingsService.getReferenceSetting(data).subscribe({
        next: (res) => {
          if (res.Messagecode === null && res.Message === null) {
            this.initial_searchKBN.set(
              res.Data.Record.initialsearchkbn
            );
            this.ReferencesKbns?.setValue({
              ReferencesSettingskbn: Number(res.Data.Record.initialsearchkbn),
            });
          } else {
            this.initial_searchKBN.set('1');
          }
          resolve(this.initial_searchKBN());
        },
        error: (err) => {
          reject(err);
        },
      });
    });
  }
}
