import {
  Component,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Dialog } from 'primeng/dialog';
import { RadioButton } from 'primeng/radiobutton';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ReferenceSettingsService } from '../../../services/core/reference-settings.service';
import { COMMON, REFERENCE_SETTING } from '../../../shared/jp-text';
import { SUCCESSMSG } from '../../../shared/messages';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-reference-initial-searchkbn',
  imports: [Dialog, FormsModule, RadioButton, ButtonModule],
  templateUrl: './reference-initial-searchkbn.component.html',
  styleUrl: './reference-initial-searchkbn.component.scss',
})
export class ReferenceInitialSearchkbnComponent implements OnChanges {
  //services
  cookieService = inject(CookieService);
  referenceSettingsService = inject(ReferenceSettingsService);
  messageService = inject(MessageService);

  //input
  formId = input.required<string>();
  tableName = input.required<string>();
  displayFlgInp = input<boolean>(false);

  //output
  closeTriggered = output<void>();
  initial_searchKBNOut = output<string>();

  //variables
  userId = JSON.parse(this.cookieService.get('user') ?? '').userid;
  textContent = REFERENCE_SETTING;
  CommonText = COMMON;

  //signal
  initial_searchKBN = signal<'1' | '2'>('1'); // 1 for yes and 2 for no
  displayFlg = signal<boolean>(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayFlgInp']) {
      this.displayFlg.set(this.displayFlgInp());
    }
  }

  saveData(): void {
    const data = {
      UserId: this.userId,
      FormId: this.formId(),
      TableName: this.tableName(),
      InitialSearchKBN: this.initial_searchKBN(),
    };
    this.referenceSettingsService.saveReferenceSetting(data).subscribe({
      next: (res) => {
        if (res.Code === 200) {
          this.messageService.add({
            severity: 'success',
            summary: SUCCESSMSG.S0001,
          });
          this.closeDialog();
        }
      },
    });
  }

  /**
   * The data will be fetched when the reference screen dialog opens(Method is used in reference screen component).
   * If the data is found then update the main kbn variable this.initial_searchKBN() with it else assing '1'
   * @returns the initial search kbn value
   */
  getData(): Promise<string> {
    const data = {
      UserId: this.userId,
      FormId: this.formId(),
      TableName: this.tableName(),
    };
    return new Promise((resolve, reject) => {
      this.referenceSettingsService.getReferenceSetting(data).subscribe({
        next: (res) => {
          if (res.Code === 200) {
            this.initial_searchKBN.set(
              res.Data.ReferenceSettings.INITIALSEARCHKBN
            );
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

  closeDialog(): void {
    this.closeTriggered.emit();
    this.displayFlg.set(false);
  }
}
