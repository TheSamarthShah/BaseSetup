import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FocusTrapModule } from 'primeng/focustrap';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageService } from 'primeng/api';
import { ERRMSG } from '../../../shared/constants/messages';
import { LoginService } from '../../../services/base/login.service';
import { Router } from '@angular/router';
import { JPTEXT } from '../../../shared/constants/jp-text';
import { AutoFocusModule } from 'primeng/autofocus';
import { CookieService } from 'ngx-cookie-service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-login',
  imports: [
    FormsModule,
    InputTextModule,
    PasswordModule,
    FocusTrapModule,
    AutoFocusModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [],
})
export class LoginComponent {
  //inject login service to make api calls
  loginService = inject(LoginService);

  //routing service to redirect to menu page after login
  router = inject(Router);

  //to display toast messages
  messageService = inject(MessageService);

  //for managing session through cookies
  cookieService = inject(CookieService);

  //bind with form ffor login
  userid = signal('');
  password = signal('');

  //variable for all the texts stored in constants
  textContent = signal(JPTEXT);
  titleService = inject(Title); // for setting title in browser tab

  //variables to hold validation result
  validationErr = signal({
    userid: false,
    password: false,
  });

  constructor() {
    this.titleService.setTitle(this.textContent().BTN_TEXT.LOGINBTN);
  }

  onInput(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement.name === 'userid') {
      this.validationErr.update((state) => ({
        ...state,
        userid: false,
      }));
    } else if (inputElement.classList.contains('p-password-input')) {
      this.validationErr.update((state) => ({
        ...state,
        password: false,
      }));
    }
  }

  submitForm() {
    //reset validation result
    this.validationErr.set({
      userid: false,
      password: false,
    });

    //validate userid
    if (this.userid() === '') {
      this.validationErr.update((state) => ({
        ...state,
        userid: true,
      }));
    }

    //validate password
    if (this.password() === '') {
      this.validationErr.update((state) => ({
        ...state,
        password: true,
      }));
    }

    //show error messages
    if (this.validationErr().userid && this.validationErr().password) {
      this.messageService.add({ severity: 'error', summary: ERRMSG.E0001 });
      return;
    } else if (this.validationErr().userid) {
      this.messageService.add({ severity: 'error', summary: ERRMSG.E0002 });
      return;
    } else if (this.validationErr().password) {
      this.messageService.add({ severity: 'error', summary: ERRMSG.E0003 });
      return;
    }

    //make call to service for login request
    this.loginService.login(this.userid(), this.password()).subscribe({
      next: (res) => {
        if (res.Code === 200) {
          const expiryMins = res.Data.userdata.JwttokenExpiry;
          const expiryDays = expiryMins / (60 * 24); // Convert minutes to days
          this.cookieService.set('jwttoken', res.Data.userdata.Jwttoken, {
            expires: expiryDays,
            path: '/',
            sameSite: 'Lax',
            secure: true,
            partitioned: false,
          });

          const userObj = {
            userid: this.userid(),
            username: res.Data.userdata.Username,
          };

          this.cookieService.set('user', JSON.stringify(userObj), {
            expires: expiryDays,
            path: '/',
            sameSite: 'Lax',
            secure: true,
            partitioned: false,
          });

          this.router.navigate(['/menu']);
        } else if (res.Code === 201) {
          this.messageService.add({ severity: 'error', summary: ERRMSG.E0004 });
        }
      },
    });
  }
}
