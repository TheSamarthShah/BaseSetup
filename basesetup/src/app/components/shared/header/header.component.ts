import { Component, inject, OnInit, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { JPTEXT } from '../../../shared/constants/jp-text';
import { CookieService } from 'ngx-cookie-service';
import { DataChangeDetectedService } from '../../../services/core/data-change-detected.service';
import { CONFIG } from '../../../shared/constants/config';

@Component({
  selector: 'app-header',
  imports: [RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit {
  //router service to detect the url has changed after login
  router = inject(Router);
  // cookie management
  cookieService = inject(CookieService);

  gridChangesService = inject(DataChangeDetectedService);
  
  //variable for all the texts stored in constants
  textContent = signal(JPTEXT);
  //version of Application
  version = CONFIG.VERSION;
  
  //userid to display only when user has logged in
  username = signal('');

  //to decide whether to display backtomenu button or not
  showBackToMenu = signal(false);

  ngOnInit(): void {
    //check every time when the url changes
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url === '/' || event.url === '/login') {
          this.username.set('');
          this.showBackToMenu.set(false);
        } else {
          this.username.set(
            JSON.parse(this.cookieService.get('user') ?? '').username
          );

          if (event.url === '/menu') {
            this.showBackToMenu.set(false);
          } else {
            this.showBackToMenu.set(true);
          }
        }
      }
    });
  }

  logout() {
    if(!this.gridChangesService.dataChangeKBN()){
      this.cookieService.delete('user', '/');
      this.cookieService.delete('jwttoken', '/');
    }
    this.router.navigate(['/']);
  }
}
