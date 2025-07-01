import { Component, input, signal } from '@angular/core';
import { DialogModule } from 'primeng/dialog';

@Component({
  selector: 'app-cell-summary-output',
  imports: [DialogModule],
  templateUrl: './cell-summary-output.component.html',
  styleUrl: './cell-summary-output.component.scss',
})
export class CellSummaryOutputComponent {
  isCellModeEnabled = input.required<boolean>();
  options = input.required<any[]>();
  computedValues = input.required<Record<string, string>>();

  showSummaryDialog = signal<boolean>(true);
}
