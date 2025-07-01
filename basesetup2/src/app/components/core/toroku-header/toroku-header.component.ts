import { Component, input } from '@angular/core';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-toroku-header',
  imports: [TagModule],
  templateUrl: './toroku-header.component.html',
  styleUrl: './toroku-header.component.scss',
})
export class TorokuHeaderComponent {
  //inputs
  formTitle = input.required<string>();
  currModeTitle = input.required<string>();
}
