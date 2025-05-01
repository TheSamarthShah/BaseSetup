import { Routes } from '@angular/router';

export const routes: Routes = [
    {
        path: '',
        pathMatch: 'full',
        loadComponent: async () => {
          const c = await import('./components/base/login/login.component');
          return c.LoginComponent;
        },
      },
      {
        path: 'login',
        loadComponent: async () => {
          const c = await import('./components/base/login/login.component');
          return c.LoginComponent;
        },
      },
];
