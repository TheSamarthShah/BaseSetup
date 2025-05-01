import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { JPTEXT } from '../../../shared/constants/jp-text';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-menu',
  imports: [RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent {
  textContent = signal(JPTEXT);
  titleService = inject(Title); // for setting title in browser tabs

  constructor() {
    this.titleService.setTitle(this.textContent().MENU.TITLE);
  }
}
