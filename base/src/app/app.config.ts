import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { CORE_ESSENTIALS, CoreEssentials } from '../core/shared/core-essentials.interface';
import { ENDPOINTS } from './shared/endpoints';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS, MatFormFieldDefaultOptions } from '@angular/material/form-field';

const coreConfig: CoreEssentials = {
  BASE_ENDPOINT: ENDPOINTS.BASE,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes),
    {provide: CORE_ESSENTIALS , useValue: coreConfig},
    {
      provide: MAT_FORM_FIELD_DEFAULT_OPTIONS,
      useValue: {
        appearance: 'outline',
        subscriptSizing: 'dynamic'
      } as MatFormFieldDefaultOptions
    }
  ]
};
