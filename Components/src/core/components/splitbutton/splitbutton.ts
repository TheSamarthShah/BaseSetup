import { CommonModule } from '@angular/common';
import {
  Component,
  input,
  output,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuTrigger } from '@angular/material/menu';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'acty-splitbutton',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatMenuTrigger,
    MatMenuModule,
    CommonModule,
  ],
  templateUrl: './splitbutton.html',
  styleUrl: './splitbutton.scss',
  standalone: true
})
export class Splitbutton {
  //types: filled, outlined
  type = input.required<'outlined' | 'filled'>();
  text = input<string>();
  disabled = input<boolean>();
  /** Items for dropdown menu */
  menuItems = input.required<{ label: string; icon?: string }[]>();
  severity = input<
    'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger'
  >('primary');
  leftIcon = input();

  /** Event when main button clicked */
  clicked = output<void>();
  /** Event when dropdown menu item clicked */
  menuClicked = output<{ label: string; icon?: string }>();
}
