import { Component, effect, inject, signal } from '@angular/core';
import { ActyDialogData, DialogButton } from '../../../model/shared/acty-dialog-props.type';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { ActyDialogService } from '../../../services/shared/acty-dialog.service';

@Component({
  selector: 'app-acty-dialog',
  imports: [DialogModule,ButtonModule],
  templateUrl: './acty-dialog.component.html',
  styleUrl: './acty-dialog.component.scss'
})
export class ActyDialogComponent {
  private dialogService = inject(ActyDialogService);
  
  visible = signal(false);
  data = signal<ActyDialogData | null>(null);

  constructor() {
    effect(() => {
      this.dialogService.dialogData$.subscribe((data: ActyDialogData | null) => {
        this.data.set(data);
        this.visible.set(true);
      });
    });
  }

  /**
   * when any button is clicked from dialog then execute its callback and close the dialog
   * @param btn 
   */
  handleButtonClick(btn: DialogButton) {
    btn.callback?.();
    this.visible.set(false);
  }
}
