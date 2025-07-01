import {
  Component,
  signal,
  input,
  output,
  SimpleChanges,
  inject,
  OnChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AUTOMATIC_HEIGHT_ADJUSTMENT } from '../../../shared/jp-text';
import { RadioButton } from 'primeng/radiobutton';
import { Dialog } from 'primeng/dialog';
import { AutomaticAdjustmentService } from '../../../services/core/automatic-adjustment.service';
import { SUCCESSMSG } from '../../../shared/messages';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-automatic-adjustment',
  imports: [Dialog, FormsModule, RadioButton, ButtonModule],
  templateUrl: './automatic-adjustment.component.html',
  styleUrl: './automatic-adjustment.component.scss',
})
export class AutomaticAdjustmentComponent implements OnChanges {
  //for making API calls
  service = inject(AutomaticAdjustmentService);
  //for displaying Toast messages
  messageService = inject(MessageService);
  formID = input.required();
  //flag to manage hide and show of popup
  displayInp = input<boolean>(false);

  closeTriggered = output();
  autoAdjustmentOut = output<string>();

  textContent: any = AUTOMATIC_HEIGHT_ADJUSTMENT;

  autoAdjustmentKBN = signal<string>('1');
  displayFlg = signal(false);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['displayInp']) {
      this.displayFlg.set(this.displayInp());

      this.service.getData(this.formID()).subscribe({
        next: (res) => {
          if (res.Code === 200) {
            this.autoAdjustmentKBN.set(res.Data.AdjustMentData.PNLHEIGHTKBN);
            this.displayFlg.set(this.displayInp()); //display popup
          } else if (res.Code === 201) {
            this.displayFlg.set(this.displayInp()); //display popup
          }
        },
      });
    }
  }

  //This function is used to close the popup
  closeModel(): void {
    this.displayFlg.set(false);
    this.closeTriggered.emit();
  }

  //This function is used to save the changes
  saveChange(): void {
    //save data to database using API
    this.service
      .savechanges(this.formID(), this.autoAdjustmentKBN())
      .subscribe({
        next: (data) => {
          if (data.Code === 200) {
            this.messageService.add({
              severity: 'success',
              summary: SUCCESSMSG.S0001,
            });
            this.autoAdjustmentOut.emit(this.autoAdjustmentKBN());
          }
          this.closeModel();
        },
        error: (err) => {
          this.closeModel();
        },
      });
  }
}
