import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { providePrimeNG } from 'primeng/config';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { authInterceptor } from './interceptor/auth.interceptor';
import Aura from '@primeng/themes/aura';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimations(),
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura,
        options: {
          darkModeSelector: false || 'none',
        },
      },
      translation: {
        today: '今日', // Translate 'Today' button text to Japanese
        clear: 'クリア', // Translate 'Clear' button text to Japanese
        dateIs: '日付は', // Translate 'Date is' to Japanese
        dateFormat: 'yy/mm/dd', // Date format in Japanese style
        firstDayOfWeek: 0, // Set Sunday as the first day of the week
        dayNamesMin: ['日', '月', '火', '水', '木', '金', '土'], // Days of the week in Japanese
        monthNames: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
        monthNamesShort: [
          '1月',
          '2月',
          '3月',
          '4月',
          '5月',
          '6月',
          '7月',
          '8月',
          '9月',
          '10月',
          '11月',
          '12月',
        ],
      },
    }),
    CookieService,
    MessageService,
  ],
};
