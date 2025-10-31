import { CommonModule } from '@angular/common';
import {
  AfterContentInit,
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  forwardRef,
  input,
  Input,
  model,
  output,
  Output,
  QueryList,
  signal,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'acty-tab-control',
  templateUrl: './tabcontrol.html',
  styleUrl: './tabcontrol.scss',
  imports: [CommonModule, TranslateModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TabControl),
      multi: true,
    },
  ],
})
export class TabControl implements AfterContentInit {
  @ContentChildren('tab', { descendants: true, read: ElementRef })
  tabs!: QueryList<ElementRef>;

  tabWidth = input(450);
  tabChange = output<void>();

  activeIndex = 0;
  totalWidth = 0;
  tabLabels = model<string[]>([]);

  ngAfterContentInit() {
    setTimeout(() => {
      this.showActiveTab();
      this.calculateTabWidth();
    });

    this.tabs.changes.subscribe(() => {
      setTimeout(() => {
        this.updateLabels();
        this.showActiveTab();
        this.calculateTabWidth();
      });
    });
  }

  private updateLabels() {
    if (!this.tabLabels() || this.tabLabels().length === 0) {
      this.tabLabels.set(
        this.tabs
          .toArray()
          .map((tab) => tab.nativeElement.getAttribute('label') || 'Tab')
      );
    }
  }

  private calculateTabWidth() {
    this.totalWidth = this.tabLabels().length * this.tabWidth();
  }

  private showActiveTab() {
    this.tabs.forEach((tab, i) => {
      tab.nativeElement.style.display =
        i === this.activeIndex ? 'block' : 'none';
    });
  }

  selectTab(index: number) {
    if (this.activeIndex !== index) {
      this.activeIndex = index;
      this.showActiveTab();
      this.tabChange.emit();
    }
  }
}
