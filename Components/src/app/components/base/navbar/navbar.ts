import { Component, output } from '@angular/core';
import { MatIconModule } from "@angular/material/icon";
import { RouterModule } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'navbar',
  imports: [
    MatToolbarModule,
    MatIconModule,
    RouterModule,
  MatButtonModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.scss'
})
export class Navbar {
  sidenavOpened = true;

  sidenavOpenedEmitter = output<boolean>();
}
