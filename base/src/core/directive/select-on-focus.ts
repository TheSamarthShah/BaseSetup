import { AfterViewInit, Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[actySelectOnFocus]'
})
export class SelectOnFocus implements AfterViewInit{
  private inputElement: HTMLInputElement | null = null;

  constructor(private el: ElementRef) {}

  ngAfterViewInit(): void {
    // Wait until the DOM settles to access the internal input
    setTimeout(() => {
      // If it's a regular input, use it directly
      if (this.el.nativeElement.tagName === 'INPUT') {
        this.inputElement = this.el.nativeElement;
      } else {
        // Try to find an <input> inside (like in p-datepicker)
        this.inputElement = this.el.nativeElement.querySelector('input');
      }
    });
  }

  @HostListener('focusin')
  onFocus(): void {
    setTimeout(() => {
      this.inputElement?.select();
    });
  }

}
