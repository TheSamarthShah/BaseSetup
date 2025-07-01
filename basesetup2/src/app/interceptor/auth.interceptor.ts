import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { catchError, EMPTY, from, switchMap, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { DataChangeDetectedService } from '../services/core/data-change-detected.service';
import { FormStateService } from '../services/base/form-state.service';
import { CONFIG } from '../shared/config';
import { ERRMSG } from '../shared/messages';
import { ActyDialogService } from '../services/shared/acty-dialog.service';
import { ActyCommonService } from '../services/shared/acty-common.service';
import { COMMON } from '../shared/jp-text';
import { ToastErrorService } from '../services/shared/toast-error.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  //injecting router to reidrect to login page
  const router = inject(Router);
  const messageService = inject(MessageService);
  const dataChangeDetectedService = inject(DataChangeDetectedService);
  const formstateservice = inject(FormStateService);
  const actyDialog = inject(ActyDialogService);
  const toastErrorSerivce = inject(ToastErrorService);
  const actyCommonService = inject(ActyCommonService);

  const token: string = cookieService.get('jwttoken');
  const refreshtoken: string = cookieService.get('refreshtoken');
  const userid = (() => {
    try {
      return JSON.parse(cookieService.get('user') || '{}')?.userid;
    } catch {
      return undefined;
    }
  })();
  const hideTime = CONFIG.TOAST.LIFE;

  // Clone the request to add Authorization header if token exists
  let newReq = req.clone({
    setHeaders: token ? { Authorization: `Bearer ${token}` } : {},
  });

  return next(newReq).pipe(
    catchError((e) => {
      // In case of export data the error type will be blob and in that case convert error in json
      if (e.error instanceof Blob) {
        const reader = new FileReader();
        let parsedError;
        reader.readAsText(e.error);

        reader.onload = function (event) {
          // Convert the Blob to a text
          const text = event.target?.result as string;
          parsedError = JSON.parse(text);
          if (parsedError.Code === 500) {
            const errorId = parsedError.ErrorId;
            const errorMessage = parsedError.Message;
            messageService.add({
              severity: 'error',
              summary: 'Error: ' + errorId,
              detail: ERRMSG.E0002,
              sticky: true,
            });
          } else if (parsedError.Code === 404) {
            const errorId = parsedError.ErrorId;
            const errorMessage = parsedError.Message;
            messageService.add({
              severity: 'error',
              summary: 'Error: ' + errorId,
              detail: ERRMSG.E0007,
              sticky: true,
            });
          }
        };
      } else {
        // 0 is for server unreachable
        if (e.status === 0) {
          const result = actyDialog.show({
            message: 'Server is unreachable.',
            header: 'Network Error',
            buttons: [
              {
                label: COMMON.OK_BTN,
                severity: 'primary',
              },
            ],
          });
        }
        // if 401 then try to refresh jwt token else redirect to root url
        else if (e.status === 401) {
          return from(
            // refresh the jwt token
            actyCommonService.getRefreshedJWTToken(userid, refreshtoken)
          ).pipe(
            // use switchMap because next(newReq) is an observable inside an observable
            switchMap((newToken: any) => {
              // Clone the failed request and attach the new token
              const newReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
              return next(newReq); // Retry the failed request with new token
            }),
            catchError((err) => {
              const baseUrl = (
                document.getElementsByTagName('base')[0]?.href ||
                window.location.origin
              ).replace(/\/$/, '');
              const currentUrl = window.location.href;
              // Extract the part after baseUrl
              const pathSegment = currentUrl
                .replace(baseUrl, '')
                .replace(/^\//, '');

              // Extract the first segment of the current browser path and store it in the `url` signal
              if (!formstateservice.lastRoute) {
                formstateservice.lastRoute = pathSegment;
              }
              // if fails to refresh jwt token then delete cookeis and go to '/'
              cookieService.delete('user', '/');
              cookieService.delete('jwttoken', '/');
              cookieService.delete('refreshtoken', '/');
              dataChangeDetectedService.dataChangeListReset();

              router.navigate(['/login']);
              return EMPTY;
            })
          );
        }
        // if 500 then there will be an
        else if (e.status === 500 && e.error) {
          const errorId = e.error.ErrorId;
          const errorMessage = e.error.Message;
          messageService.add({
            severity: 'error',
            summary: 'Error: ' + errorId,
            detail: ERRMSG.E0002,
            sticky: true,
          });
        }
        // 404 if for not found and 405 for Method Not Allowed
        else if (e.status === 404 || e.status === 405) {
          if (e.error.Message === 'EX1003') {
            const errorId = e.error.ErrorId;
            const errorMessage = ERRMSG.E0007;
            messageService.add({
              severity: 'error',
              summary: 'Error: ' + errorId,
              detail: `${errorMessage}`,
              sticky: true,
            });
          } else {
            const errorId = Date.now().toString();
            const errorLogMessage = e.message;
            const errorMessage = ERRMSG.E0004;
            // Try to log the error
            const logError = toastErrorSerivce.logErrorToApi(
              errorId!,
              errorLogMessage!
            );
            messageService.add({
              severity: 'error',
              summary: 'Error: ' + errorId,
              detail: `${errorMessage}`,
              sticky: true,
            });
          }
        }
        // Code 409 is for conficts.
        else if (e.status === 409) {
          // In API EX1001 is reserved for RowModified case based on Updtdt column
          if (e.error.Message === 'EX1001') {
            const errorId = e.error.ErrorId;
            const errorMessage = ERRMSG.E0006;
            messageService.add({
              severity: 'error',
              summary: 'Error: ' + errorId,
              detail: `${errorMessage}`,
              sticky: true,
            });
          }
          // When duplicate primary key row is sent for insert
          else if (e.error.Message === 'EX1002') {
            const errorId = e.error.ErrorId;
            const errorMessage = ERRMSG.E0012;
            messageService.add({
              severity: 'error',
              summary: 'Error: ' + errorId,
              detail: `${errorMessage}`,
              sticky: true,
            });
          }
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
            sticky: true,
          });
        }
      }
      return throwError(() => e);
    })
  );
};
