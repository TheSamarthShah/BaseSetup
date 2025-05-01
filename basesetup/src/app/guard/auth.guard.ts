import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { ERRMSG } from '../shared/constants/messages';

export const authGuard: CanActivateFn = (route, state) => {
  //injecting router to reidrect to login page
  const router = inject(Router);
  const cookieService = inject(CookieService);
  const messageService = inject(MessageService);

  //token stored in cookies at login time
  const token = cookieService.get('jwttoken');

  //token not found means login is not done then redirect to login screen
  if (token) {
    return true;
  } else {
    messageService.add({ severity: 'error', summary: ERRMSG.E0008 });
    router.navigate(['/']);
    return false;
  }
};
