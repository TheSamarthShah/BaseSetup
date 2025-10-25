import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Layout } from '../core/components/base/layout/layout';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Layout],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('base');
}
