import { Routes } from '@angular/router';
import { AppLayout } from './layout/component/app.layout';
import { Mitem0010uComponent } from './components/master/mitem0010u/mitem0010u.component';
import { Mitem0010iComponent } from './components/master/mitem0010i/mitem0010i.component';
import { Mitem0011uComponent } from './components/master/mitem0011u/mitem0011u.component';
import { LoginComponent } from './components/base/login/login.component';
import { authGuard } from './guard/auth.guard';
import { A0015uComponent } from './components/master/a0015u/a0015u.component';
import { unsavedChangesGuard } from './guard/unsaved-changes.guard';
import { D101Component } from './components/seizou/d101/d101.component';
import { D103Component } from './components/seizou/d103/d103.component';
import { D201Component } from './components/seizou/d201/d201.component';
import { D204Component } from './components/seizou/d204/d204.component';
import { D205Component } from './components/seizou/d205/d205.component';
import { NotfoundComponent } from './components/base/notfound/notfound.component';
import { a103Component } from './components/master/a103/a103.component';
import { a104Component } from './components/master/a104/a104.component';
import { a105Component } from './components/master/a105/a105.component';
import { C101Component } from './components/shiji/c101/c101.component';
import { c105Component } from './components/shiji/c105/c105.component';
import { D104Component } from './components/seizou/d104/d104.component';
import { F101Component } from './components/zaiko/f101/f101.component';
import { B110Component } from './components/plan/b110/b110.component';
import { C110Component } from './components/shiji/c110/c110.component';
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
        path: 'mitem0010u',
        component: Mitem0010uComponent,
      },
      {
        path: 'mitem0010i',
        component: Mitem0010iComponent,
      },
      {
        path: 'mitem0011u',
        component: Mitem0011uComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'a0015u',
        component: A0015uComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'a103',
        component: a103Component,
      },
      {
        path: 'a104',
        component: a104Component,
      },
      {
        path: 'a105',
        component: a105Component,
      },
      {
        path: 'c105',
        component: c105Component,
      },
      {
        path: 'd101',
        component: D101Component,
      },
      {
        path: 'D103',
        component: D103Component,
      },
      {
        path: 'd104',
        component: D104Component,
      },
      {
        path: 'd201',
        component: D201Component,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'd204',
        component: D204Component,
      },
      {
        path: 'D205',
        component: D205Component,
      },
      {
        path: 'c101',
        component: C101Component,
      },
      {
        path: 'f101',
        component: F101Component,
      },
      {
        path: 'c110',
        component: C110Component,
      },
      {
        path: 'b110',
        component: B110Component,
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
