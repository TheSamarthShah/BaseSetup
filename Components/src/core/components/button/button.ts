import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'acty-button',
  imports: [MatButtonModule, MatIconModule, CommonModule],
  templateUrl: './button.html',
  styleUrl: './button.scss',
  standalone: true,
})
export class Button {
  //types: filled, outlined, icon, mini fab
  type = input.required<'outlined' | 'filled' | 'icon' | 'mini fab' | 'text'>();
  disabled = input<boolean>();
  text = input();
  leftIcon = input();
  rightIcon = input();
  btnClass = input();
  severity = input<
    'primary' | 'secondary' | 'success' | 'info' | 'warn' | 'help' | 'danger'
  >('primary');

  clicked = output<void>();
}
