import { inject, Pipe, PipeTransform } from '@angular/core';
import { DatepickerI18nService } from '../services/datepicker-i18n-service';
import { TranslateService } from '@ngx-translate/core';

@Pipe({
  name: 'actyDate',
  standalone: true,
})
export class ActyDatePipe implements PipeTransform {
  private readonly datepickerI18n = inject(DatepickerI18nService);

  transform(
    value: Date | string | number | null | undefined,
    currentLang: string,
    showTime: boolean = false,
  ): string {
    if (!value) return '';

    const date = this.parseDate(value);
    if (!date || isNaN(date.getTime())) return '';

    // The pipe will re-run when currentLang changes
    return this.datepickerI18n.formatDate(date, showTime);
  }

  private parseDate(value: Date | string | number): Date | null {
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') {
      const date = new Date(value);
      return isNaN(date.getTime()) ? null : date;
    }
    return null;
  }
}