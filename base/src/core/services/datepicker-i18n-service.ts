import { Injectable, OnDestroy, inject } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DatepickerI18nService
  extends MatDatepickerIntl
  implements OnDestroy
{
  private readonly translate = inject(TranslateService);
  private readonly dateAdapter = inject(DateAdapter<Date>);
  private sub?: Subscription;

  constructor() {
    super();
    // Initialize with current language
    this.updateLocale(this.translate.currentLang);

    // Listen to language changes
    this.sub = this.translate.onLangChange.subscribe((event) => {
      this.updateLocale(event.lang);
    });
  }

  /** Update locale and datepicker labels */
  private updateLocale(lang: string): void {
    const locale = this.mapLangToLocale(lang);
    this.dateAdapter.setLocale(locale);

    // Trigger change notifications for datepicker
    this.changes.next();
  }

  /** Map app language code to locale string */
  private mapLangToLocale(lang: string): string {
    switch (lang) {
      case 'jp':
        return 'ja-JP';
      case 'en':
        return 'en-US';
      default:
        return 'en-US';
    }
  }

  /** Format a date based on current language */
  formatDate(date: Date | null, showTime: boolean = false): string {
    if (!date) return '';

    // Always use DateAdapter for date part
    const datePattern = this.getDateFormatPattern();
    const datePart = this.dateAdapter.format(date, datePattern);

    // Append time manually if requested
    if (showTime) {
      const timePart = this.formatTime(date);
      return `${datePart} ${timePart}`;
    }

    return datePart;
  }

  /** Get date format pattern based on language */
  private getDateFormatPattern(): string {
    const lang = this.translate.currentLang;

    switch (lang) {
      case 'jp':
        return 'yyyy/MM/dd'; // Japanese style
      case 'en':
      default:
        return 'MM/dd/yyyy'; // English style
    }
  }

  /** Format time based on current language */
  private formatTime(date: Date): string {
    const lang = this.translate.currentLang;

    if (lang === 'jp') {
      // Japanese 24-hour format
      return `${date.getHours().toString().padStart(2, '0')}:${date
        .getMinutes()
        .toString()
        .padStart(2, '0')}`;
    } else {
      // English 12-hour format with AM/PM
      const hours = date.getHours();
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      const twelveHour = hours % 12 || 12;
      return `${twelveHour}:${minutes} ${ampm}`;
    }
  }

  /** Get current locale */
  getCurrentLocale(): string {
    return this.mapLangToLocale(this.translate.currentLang);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}