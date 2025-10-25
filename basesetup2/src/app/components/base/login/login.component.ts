import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { MessageModule } from 'primeng/message';
import { COMMON, LOGIN } from '../../../shared/jp-text';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { ERRMSG } from '../../../shared/messages';
import { LoginService } from '../../../services/base/login.service';
import { Title } from '@angular/platform-browser';
import { FormStateService } from '../../../services/base/form-state.service';
import { CookieService } from 'ngx-cookie-service';
import { MessageService } from 'primeng/api';
import { AutoFocusModule } from 'primeng/autofocus';
import { ToastModule } from 'primeng/toast';
import { CONFIG } from '../../../shared/config';

@Component({
  selector: 'app-login',
  imports: [
    ButtonModule,
    InputTextModule,
    PasswordModule,
    FormsModule,
    RouterModule,
    RippleModule,
    MessageModule,
    AppFloatingConfigurator,
    AutoFocusModule,
    ToastModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  //inject login service to make api calls
  loginService = inject(LoginService);
  //routing service to redirect to menu page after login
  router = inject(Router);
  //for managing session through cookies
  cookieService = inject(CookieService);
  // for setting title in browser tab
  titleService = inject(Title);
  formstateservice = inject(FormStateService);
  //to display toast messages
  messageService = inject(MessageService);

  textContent: any = LOGIN;
  title: string = COMMON.PROJECT_NAME;
  errMsgs: any = ERRMSG;
  userid: string = '';
  password: string = '';
  //variables to hold validation result
  validationErr: {
    userid: boolean;
    password: boolean;
  } = {
    userid: false,
    password: false,
  };
  toastLifeTime: number = CONFIG.TOAST.LIFE;

  constructor() {
    this.titleService.setTitle(this.textContent.LOGIN_BTN);
  }

  onInput(inpName: string): void {
    if (inpName === 'userid') {
      this.validationErr.userid = false;
    } else if (inpName === 'password') {
      this.validationErr.password = false;
    }
  }

  submitForm(): void {
    //reset validation result
    this.validationErr = {
      userid: false,
      password: false,
    };

    //validate userid
    if (this.userid === '') {
      this.validationErr.userid = true;
    }

    //validate password
    if (this.password === '') {
      this.validationErr.password = true;
    }

    //show error messages
    if (this.validationErr.userid || this.validationErr.password) {
      return;
    }

    //make call to service for login request
    this.loginService.login(this.userid, this.password).subscribe({
      next: (res) => {
        console.log(res)
        if (res.Code === 200) {
          this.cookieService.set('jwttoken', res.Data.userdata.Jwttoken, {
            path: '/',
            sameSite: 'Lax',
            secure: true,
            partitioned: false,
          });
          // dont set expiry as its needed for refreshing jwt token
          this.cookieService.set(
            'refreshtoken',
            res.Data.userdata.Refreshtoken,
            {
              path: '/',
              sameSite: 'Lax',
              secure: true,
              partitioned: false,
            }
          );

          const userObj = {
            userid: this.userid,
            username: res.Data.userdata.Username,
            chargecd: res.Data.userdata.Chargecd,
            chargenm: res.Data.userdata.Chargenm,
          };

          // dont set expiry as userid is needed for refreshing jwt token
          this.cookieService.set('user', JSON.stringify(userObj), {
            path: '/',
            sameSite: 'Lax',
            secure: true,
            partitioned: false,
          });
          // Retrieve the stored redirect page name (mainly after session expired)
          const redirectPageName = this.formstateservice.lastRoute;
          if (redirectPageName) {
            this.formstateservice.lastRoute = undefined;

            // Use URL to parse path and query
            const url = new URL(redirectPageName, window.location.origin);
            const path = url.pathname.replace(/^\//, ''); // remove leading slash if any

            const queryParams: { [key: string]: any } = {};
            url.searchParams.forEach((value, key) => {
              queryParams[key] = value;
            });

            // Navigate with path and query parameters to their last active page
            this.router.navigate([`/${path}`], { queryParams });
          } else {
            //navigate to the default page
            this.router.navigate(['/']);
          }
        } else if (res.Code === 201) {
          this.messageService.add({
            severity: 'error',
            summary: ERRMSG.E0001,
            sticky: true,
          });
        }
      },
    });
  }
}
