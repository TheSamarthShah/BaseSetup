import { Component, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { COMMON } from '../../shared/jp-text';
import { CookieService } from 'ngx-cookie-service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator],
  template: ` <div class="layout-topbar">
    <div class="layout-topbar-logo-container">
      <button
        class="layout-menu-button layout-topbar-action"
        (click)="layoutService.onMenuToggle()"
      >
        <i class="pi pi-bars"></i>
      </button>
      <a class="layout-topbar-logo" routerLink="/">
        <img src="thomas.png" class="h-10"/>
      </a>
    </div>

    <div class="layout-topbar-actions">
      <div class="layout-config-menu">
        <button
          type="button"
          class="layout-topbar-action"
          (click)="toggleDarkMode()"
        >
          <i
            [ngClass]="{
              'pi ': true,
              'pi-moon': layoutService.isDarkTheme(),
              'pi-sun': !layoutService.isDarkTheme()
            }"
          ></i>
        </button>
        <div class="relative">
          <button
            class="layout-topbar-action layout-topbar-action-highlight"
            pStyleClass="@next"
            enterFromClass="hidden"
            enterActiveClass="animate-scalein"
            leaveToClass="hidden"
            leaveActiveClass="animate-fadeout"
            [hideOnOutsideClick]="true"
          >
            <i class="pi pi-palette"></i>
          </button>
          <app-configurator />
        </div>
      </div>

      <div class="grid content-center text-xl">
        <div>{{ username }}</div>
      </div>
    </div>
  </div>`,
})
export class AppTopbar {
  // cookie management
  cookieService = inject(CookieService);

  items!: MenuItem[];
  title: string = COMMON.PROJECT_NAME;
  username: string = JSON.parse(this.cookieService.get('user') ?? '').username;
  constructor(public layoutService: LayoutService) {}

  toggleDarkMode() {
    this.layoutService.layoutConfig.update((state) => ({
      ...state,
      darkTheme: !state.darkTheme,
    }));
  }
}
