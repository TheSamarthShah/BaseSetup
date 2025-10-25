import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { LoginComponent } from './components/base/login/login.component';
import { authGuard } from './guard/auth.guard';
import { unsavedChangesGuard } from './guard/unsaved-changes.guard';
import { D201Component } from './components/seizou/d201/d201.component';
import { NotfoundComponent } from './components/base/notfound/notfound.component';
import { F101Component } from './components/zaiko/f101/f101.component';
import { MymenuComponent } from './components/base/mymenu/mymenu.component';

export const appRoutes: Routes = [
  {
    path: '',
    component: AppLayout,
    children: [
      {
        path: '',
        component: MymenuComponent,
      },
      {
        path: 'd201',
        component: D201Component,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'f101',
        component: F101Component,
      },
    ],
    canActivate: [authGuard],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'notfound',
    component: NotfoundComponent,
  },
  {
    path: '**',
    redirectTo: '/notfound',
  },
];
