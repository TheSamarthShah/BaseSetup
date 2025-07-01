import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DataChangeDetectedService } from './services/core/data-change-detected.service';
import { ActyDialogComponent } from './components/shared/acty-dialog/acty-dialog.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ActyDialogComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  DataChangeDetected = inject(DataChangeDetectedService);

  constructor() {
    if (
      window.location.pathname != '/' &&
      window.location.pathname != '/menu'
    ) {
      // Set up an event handler to prevent user from leaving the page
      // when there are unsaved data changes
      window.onbeforeunload = (e: BeforeUnloadEvent): string | undefined => {
        if (this.DataChangeDetected.dataChangeList.length > 0 || this.DataChangeDetected.netRowChangeCounter > 0) {
          e.preventDefault();
        }
        return undefined;
      };

      // Set up an event handler to prevent user from refreshing the page
      // when there are unsaved data changes
      (window as Window).onhashchange = (e: HashChangeEvent) => {
        if (this.DataChangeDetected.dataChangeList.length > 0 || this.DataChangeDetected.netRowChangeCounter > 0) {
          e.preventDefault();
        }
      };
    }
  }
}
