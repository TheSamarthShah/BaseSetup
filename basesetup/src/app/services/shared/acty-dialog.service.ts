import { Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs';
import { ActyDialogData } from '../../model/shared/acty-dialog-props.type';

@Injectable({ providedIn: 'root' })
export class ActyDialogService {
  private confirmationData$ = new ReplaySubject<ActyDialogData>(1);
  
  /**
   * Show dialog which return promise with button index
   * 
   * @param data 
   * @returns button index (starts from 0)
   */
  show(data: ActyDialogData): Promise<number> {
    return new Promise((resolve) => {
      // Apply default 'mainBtn' class if none provided
      const buttons = (data.buttons ?? []).map((btn, index) => ({
        label: btn.label,
        styleClass: btn.styleClass || 'mainBtn', // Default class
        callback: () => {
          btn.callback?.();
          resolve(index);
        }
      }));

      // By default one button of OK will be there in dialog
      if (buttons.length === 0) {
        buttons.push({
          label: 'OK',
          styleClass: 'mainBtn',
          callback: () => resolve(0)
        });
      }

      this.confirmationData$.next({ 
        ...data, 
        buttons 
      });
    });
  }

  // Observable for dialog data
  get dialogData$() {
    return this.confirmationData$.asObservable();
  }
}