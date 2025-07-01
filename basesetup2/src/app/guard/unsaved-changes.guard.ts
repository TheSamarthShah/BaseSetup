import { CanDeactivateFn } from '@angular/router';
import { confirmChangesGuardComponent } from '../model/shared/confirm-changes-guard-props.type';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const unsavedChangesGuard: CanDeactivateFn<
  confirmChangesGuardComponent
> = async (component, currentRoute, currentState, nextState) => {
  const cookieService = inject(CookieService);
  const token = cookieService.get('jwttoken');

  if (!token) return true; // if jwt token is expiered then dont show confirm dialog

  if (!component.confirmChanges) return true;

  const result = await component.confirmChanges();

  return result.proceed;
};
