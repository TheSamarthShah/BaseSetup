import { Component, signal, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../app/components/shared/header/header.component';
import { ActyDialogComponent } from './components/shared/acty-dialog/acty-dialog.component';
import { ToastModule } from 'primeng/toast';
import { CONFIG } from './shared/constants/config';
import { DataChangeDetectedService } from './services/core/data-change-detected.service';
import { ToastErrorService } from './services/shared/toast-error.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ActyDialogComponent, ToastModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  //time for hiding toast
  hideTime = signal(CONFIG.TOAST.LIFE);
  DataChangeDetected = inject(DataChangeDetectedService);
  toastErrorService = inject(ToastErrorService);

  constructor() {
    if (
      window.location.pathname != '/' &&
      window.location.pathname != '/menu'
    ) {
      // Set up an event handler to prevent user from leaving the page
      // when there are unsaved data changes
      window.onbeforeunload = (e: BeforeUnloadEvent): string | undefined => {
        if (this.DataChangeDetected.dataChangeKBN()) {
          e.preventDefault();
        }
        return undefined;
      };

      // Set up an event handler to prevent user from refreshing the page
      // when there are unsaved data changes
      (window as Window).onhashchange = (e: HashChangeEvent) => {
        if (this.DataChangeDetected.dataChangeKBN()) {
          e.preventDefault();
        }
      };
    }
  }
}
