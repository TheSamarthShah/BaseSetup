import { CommonModule } from '@angular/common';
import { AfterContentInit, Component, ContentChild, ElementRef, EventEmitter, forwardRef, HostListener, input, Input, model, output, Output, Renderer2, TemplateRef, ViewChild } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'acty-splitter',
  templateUrl: './splitter.html',
  styleUrl: './splitter.scss',
  imports: [
    CommonModule,
    MatTooltipModule,
    MatIconModule
  ],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Splitter),
      multi: true
    }
  ]
})
export class Splitter {
  @ViewChild('splitContainer', { static: true }) splitContainer!: ElementRef;  
  
  direction = input<'horizontal' | 'vertical'>('horizontal');
  firstPanelMinSize = input<number>(0);
  toolTip = input<string | undefined>();
  
  sizeChange = output<number>();
  
  firstPanelSize = model<number>(30);
  

  private previousFirstPanelSize = this.firstPanelSize();
  private previousSecondPanelSize = 100 - this.firstPanelSize();

  private isDragging = false;
  private containerRect!: DOMRect;

  constructor(private elRef: ElementRef) {}


  startDragging(event: MouseEvent) {
    this.isDragging = true;
    const container = this.elRef.nativeElement.querySelector('.split-container');
    this.containerRect = container.getBoundingClientRect();
    event.preventDefault();
  }
  
  @HostListener('document:mousemove', ['$event'])
  onDrag(event: MouseEvent) {
    if (!this.isDragging) return;

    const remSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
    let newSize: number;

    if (this.direction() === 'horizontal') {
        const offset = event.clientX - this.containerRect.left;
        newSize = offset / remSize; 
    } else {
        const offset = event.clientY - this.containerRect.top;
        newSize = offset / remSize; 
    }

    const containerSizeRem = this.direction() === 'horizontal'
        ? this.containerRect.width / remSize
        : this.containerRect.height / remSize;

    const secondPanelMinSize = 3; 
    const maxFirstPanelSize = containerSizeRem - secondPanelMinSize;

    newSize = Math.min(Math.max(newSize, this.firstPanelMinSize()), maxFirstPanelSize);

  this.firstPanelSize.set(newSize);
    this.sizeChange.emit(this.firstPanelSize());
  }

  @HostListener('document:mouseup')
  stopDragging() {
    this.isDragging = false;
  }
}