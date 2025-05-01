import { HttpInterceptorFn } from '@angular/common/http';
import { inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, EMPTY, throwError } from 'rxjs';
import { ERRMSG } from '../shared/constants/messages';
import { MessageService } from 'primeng/api';
import { CONFIG } from '../shared/constants/config';
import { ActyDialogService } from '../services/shared/acty-dialog.service';
import { JPTEXT } from '../shared/constants/jp-text';
import { ToastErrorService } from '../services/shared/toast-error.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  //injecting router to reidrect to login page
  const router = inject(Router);
  const token = cookieService.get('jwttoken');
  const messageService = inject(MessageService);
  const actyDialog = inject(ActyDialogService);
  const toastErrorSerivce = inject(ToastErrorService);
  const textContent = signal(JPTEXT);
  const hideTime = signal(CONFIG.TOAST.LIFE);

  // Clone the request to add Authorization header if token exists
  let newReq = req.clone({
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(newReq).pipe(
    catchError((e) => {
      // 0 is for server unreachable
      if (e.status === 0) {
        const result = actyDialog.show({
          message: 'Server is unreachable.',
          header: 'Network Error',
          buttons: [
            {
              label: textContent().BTN_TEXT.OK,
              styleClass: 'mainBtn',
            },
          ],
          type: 'error',
        });
      }
      // if 401 then redirect to root url
      else if (e.status === 401) {
        messageService.add({
          severity: 'error',
          summary: ERRMSG.E0008,
          life: hideTime(),
        });
        router.navigate(['/']);
        return EMPTY;
      }
      // if 500 then there will be an
      else if (e.status === 500 && e.error) {
        const errorId = e.error.ErrorId;
        const errorMessage = e.error.Message;
        messageService.add({
          severity: 'error',
          summary: 'Error: ' + errorId,
          detail: ERRMSG.E0005,
          life: hideTime(),
        });
      }
      // 404 if for not found and 405 for Method Not Allowed
      else if (e.status === 404 || e.status === 405) {
        const errorId = Date.now().toString();
        const errorLogMessage = e.message;
        const errorMessage = ERRMSG.E0009;
        // Try to log the error
        const logError = toastErrorSerivce.logErrorToApi(
          errorId!,
          errorLogMessage!
        );
        messageService.add({
          severity: 'error',
          summary: 'Error: ' + errorId,
          detail: `${errorMessage}`,
          life: hideTime(),
        });
      } else {
        const errorId = Date.now().toString();
        const errorMessage = e.message;
        // Try to log the error
        const logError = toastErrorSerivce.logErrorToApi(
          errorId!,
          errorMessage!
        );
        messageService.add({
          severity: 'error',
          summary: 'Error: ' + errorId,
          detail: `${errorMessage}`,
          life: hideTime(),
        });
      }
      return throwError(() => e);
    })
  );
};
