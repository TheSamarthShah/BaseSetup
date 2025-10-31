import { Injectable} from '@angular/core';
import { Notification } from 'src/core/components/notification/notification';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  static instance: ToastService | null = null;
   private notificationComponent!: Notification;

  constructor() {
    ToastService.instance = this;
  }

    setNotificationComponent(notification: Notification) {
    this.notificationComponent = notification;
  }

   show(
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    summary?: string,
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'
  ) {
    if (!this.notificationComponent) {
      return;
    }
    this.notificationComponent.notify(type, message, summary, position);
  }
}

export function notify(
  message: string,
  type: 'success' | 'error' | 'info' | 'warning' = 'info',
  summary?: string,
  position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' = 'top-right'
): void {
  if (!ToastService.instance) {
    throw new Error('ToastService is not initialized yet!');
  }
  ToastService.instance.show(message, type, summary, position);
}
