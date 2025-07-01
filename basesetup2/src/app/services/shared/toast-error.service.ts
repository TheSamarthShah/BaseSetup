import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ActyDialogService } from './acty-dialog.service';
import { CONFIG } from '../../shared/config';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { COMMON } from '../../shared/jp-text';

@Injectable({
  providedIn: 'root',
})
export class ToastErrorService {
  http = inject(HttpClient);
  messageService = inject(MessageService);
  actyDialog = inject(ActyDialogService);

  hideTime = CONFIG.TOAST.LIFE;

  constructor() {
    this.interceptConsoleErrors();
  }

  private interceptConsoleErrors(): void {
    const originalConsoleError = console.error;

    console.error = async (...args: any[]) => {
      const isHttpError = args.some(
        (arg) => arg && typeof arg === 'object' && 'status' in arg
      );

      // Skip processing for all HTTP errors because they are handled in interpretor.
      // When we reject promises then they do console.error so we need gaurd that case
      if (isHttpError) {
        return;
      }

      // Initialize default values
      let errorId: string | null = null;
      let errorMessage: string | null = null;
      let loggedSuccessfully = true; // to track if something went wrong in logging
      let fullErrorMessage = '';

      originalConsoleError.apply(console, args);

      // If no ErrorId is found, generate a new one
      errorId = Date.now().toString();

      // Always extract full error message for logging
      fullErrorMessage = args
        .map((arg) => {
          if (arg instanceof Error) {
            return arg.message;
          } else if (typeof arg === 'object') {
            return arg.Message || arg.message || JSON.stringify(arg);
          }
          return arg;
        })
        .join(' ');

      //UI error message
      errorMessage = fullErrorMessage;

      // Try to log the error
      loggedSuccessfully = await this.logErrorToApi(
        errorId!,
        fullErrorMessage!
      );

      // if log success then show toast else there will be a dialog
      if (loggedSuccessfully) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error: ' + errorId,
          detail: `${errorMessage}`,
          sticky: true,
        });
      }
    };
  }

  logErrorToApi(errorId: string, args: string): Promise<boolean> {
    const errorDetails = {
      errorId: errorId,
      errorMessage: args,
    };
    return new Promise((resolve) => {
      this.http
        .post(
          API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.LOG_ERROR.LOG,
          errorDetails
        )
        .subscribe({
          next: (response) => {
            resolve(true); // Resolve as success
          },
          error: async (err) => {
            // if there is some error in logging then show dialog with error
            await this.actyDialog.show({
              message: args,
              header: 'Logging Failure',
              buttons: [
                {
                  label: COMMON.OK_BTN,
                  severity: 'primary',
                },
              ],
            });
            resolve(false); // Resolve as failure
          },
        });
    });
  }
}
