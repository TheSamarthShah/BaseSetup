import { Component, inject } from '@angular/core';
import { AppMenu } from './app.menu';
import { ButtonModule } from 'primeng/button';
import { LOGIN } from '../../shared/jp-text';
import { CONFIG } from '../../shared/config';
import { CookieService } from 'ngx-cookie-service';
import { Router } from '@angular/router';
import { DataChangeDetectedService } from '../../services/core/data-change-detected.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AppMenu, ButtonModule],
  template: ` <div class="layout-sidebar flex flex-col justify-between">
    <app-menu></app-menu>
    <div class="flex flex-col gap-2">
      <div class="text-center">Ver : {{ version }}</div>
      <button
        pButton
        type="button"
        severity="secondary"
        icon="pi pi-sign-out"
        [label]="logoutText"
        class="w-full"
        (click)="logout()"
      ></button>
    </div>
  </div>`,
})
export class AppSidebar {
  //router service to detect the url has changed after login
  router = inject(Router);
  // cookie management
  cookieService = inject(CookieService);
  //to detect changes in data
  dataChangesService = inject(DataChangeDetectedService);

  logoutText: string = LOGIN.LOGOUT_BTN;
  version: string = CONFIG.VERSION;

  logout() {
    //if data is not changed logout the otherwise
    if (
      this.dataChangesService.dataChangeList.length === 0 &&
      this.dataChangesService.netRowChangeCounter === 0
    ) {
      this.cookieService.delete('user', '/');
      this.cookieService.delete('jwttoken', '/');
      this.cookieService.delete('refreshtoken', '/');
    }
    this.router.navigate(['/login']);
  }
}
