import {
  Directive,
  ElementRef,
  input,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import { MetadataKey } from '../models/filter.type';
import { ColumnMetadataService } from '../services/column-metadata-service';
import { ColumnMetadata } from '../models/column-metadata.type';

@Directive({
  selector: '[appMaxLength]',
})
/**
 * Based in column's medatadata from ColumnMetadataService this directive determine weather the field is number type or string type
 * and based on the type it sets the maxlength attribute for string types
 * and for numeric type it limits the input to numeric values through regex and also checks for max value
 */
export class MaxLengthDirective {
  columnMetaDataKey = input.required<MetadataKey>({ alias: 'appMaxLength' });
  columnName = signal<string>('');
  tableName = signal<string>('');

  private el = inject(ElementRef);
  private metadataService = inject(ColumnMetadataService);

  // all column metadata
  private metadata = toSignal(
    this.metadataService
      .getColumnMetadata()
      .pipe(catchError(() => of([] as ColumnMetadata[]))),
    { initialValue: [] as ColumnMetadata[] }
  );

  constructor() {
    effect(() => {
      this.columnName.set(this.columnMetaDataKey().columnName);
      this.tableName.set(this.columnMetaDataKey().tableName);
      const columnName = this.columnName();
      const tableName = this.tableName();
      const metadata = this.metadata();

      // perticular columns metadata
      const column = metadata.find(
        (col) =>
          col.ColumnName.toLowerCase() === columnName.toLowerCase() &&
          col.TableName.toLowerCase() === tableName.toLowerCase()
      );

      this.applyAttributesBasedOnDataType(column);
    });
  }

  /**
   * applys the type and releted checks to the input
   * @param column
   * @returns
   */
  private applyAttributesBasedOnDataType(column?: ColumnMetadata): void {
    const element = this.el.nativeElement;
    // Clean up previous event listeners
    element.removeEventListener('input', this.handleNumericInput);
    element.removeEventListener('blur', this.enforceNumericLimits);

    // Clear numeric validation attributes
    delete element.dataset.maxValue;
    delete element.dataset.minValue;
    delete element.dataset.dataPrecision;
    delete element.dataset.dataScale;

    if (!column || !this.isValidColumn(column)) {
      return; // No validation if metadata is invalid/missing
    }

    if (this.isCharacterType(column.DataType)) {
      // Only set maxlength for character fields
      element.setAttribute(
        'maxlength',
        column.CharColDeclLength?.toString() ?? ''
      );
    } else if (this.isNumberType(column.DataType)) {
      // Remove maxlength for numeric fields
      element.removeAttribute('maxlength');

      const precision = column.DataPrecision ?? 38;
      const scale = column.DataScale ?? 0;
      const maxValue = this.calculateMaxValue(precision, scale);
      const minValue = this.calculateMinValue(precision, scale, maxValue);

      // Set validation attributes
      element.dataset.maxValue = maxValue.toString();
      element.dataset.minValue = minValue.toString();
      element.dataset.dataPrecision = precision.toString();
      element.dataset.dataScale = scale.toString();

      // Format the initial value to show required fraction digits (e.g., 2.00)
      this.formatInitialValue(element, scale);

      // Add numeric validation listeners
      element.addEventListener('input', this.handleNumericInput.bind(this));
      element.addEventListener('blur', this.enforceNumericLimits.bind(this));
    }
  }

  /**
   * using regex it limits the input to only numbers
   * @param event
   */
  private handleNumericInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;
    const scale = parseInt(input.dataset['dataScale'] || '0');
    const precision = parseInt(input.dataset['dataPrecision'] || '38');

    let updated = false;

    // Only numbers, minus sign, and decimal point
    if (value && !/^-?\d*\.?\d*$/.test(value)) {
      input.value = value.replace(/[^-\d.]/g, '');
      updated = true;
    }

    if (/^0+[1-9]/.test(input.value)) {
      input.value = input.value.replace(/^0+/, '');
      updated = true;
    }

    const decimalIndex = input.value.indexOf('.');
    if (decimalIndex !== -1) {
      const decimalPart = input.value.substring(decimalIndex + 1);
      if (decimalPart.length > scale) {
        input.value = input.value.substring(0, decimalIndex + 1 + scale);
        updated = true;
      }
    }

    const integerPart =
      decimalIndex === -1
        ? input.value
        : input.value.substring(0, decimalIndex);
    const digitsOnly = integerPart.replace('-', '');
    if (digitsOnly.length > precision - scale) {
      input.value = input.value.slice(0, -1);
      updated = true;
    }

    if (updated) {
      // Notify Angular of the change
      const newEvent = new Event('input', { bubbles: true });
      input.dispatchEvent(newEvent);
    }
  }

  /**
   * enforces the max number limit to the numeric input types
   * @param event
   * @returns
   */
  private enforceNumericLimits(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Handle empty input or just minus sign
    if (value === '' || value === '-') {
      input.value = '';
      return;
    }

    const numericValue = parseFloat(value);
    const maxValue = parseFloat(input.dataset['maxValue'] || 'Infinity');
    const minValue = parseFloat(input.dataset['minValue'] || '-Infinity');
    const scale = parseInt(input.dataset['dataScale'] || '0');

    if (!isNaN(numericValue)) {
      // Enforce min/max limits
      if (numericValue > maxValue) {
        value = maxValue.toString();
      } else if (numericValue < minValue) {
        value = minValue.toString();
      }

      // Format with proper decimal places
      // Show decimal scale if . exists in value
      if (scale > 0 && value.includes('.')) {
        value = parseFloat(value).toFixed(scale);
      } else {
        value = Number.parseFloat(value).toFixed(scale).toString(); 
      }
    } else {
      value = ''; // Clear invalid entries
    }

    input.value = value;
  }

  private isValidColumn(column: ColumnMetadata): boolean {
    return (
      !!column?.DataType &&
      (this.isCharacterType(column.DataType) ||
        this.isNumberType(column.DataType))
    );
  }

  private isCharacterType(dataType: string): boolean {
    return /varchar2|char|nchar|nvarchar2|clob|nclob|text/i.test(dataType);
  }

  private isNumberType(dataType: string): boolean {
    return /number|numeric|float|decimal|integer/i.test(dataType);
  }
  /**
   * calculates the max value for the numeric types
   * @param dataPrecision - Total number of digits allowed.
   * @param dataScale - Number of digits allowed after the decimal point.
   * @returns The maximum value representable with the given precision and scale.
   */
  private calculateMaxValue(dataPrecision: number, dataScale: number): number {
    if (dataScale > 0) {
      return (Math.pow(10, dataPrecision) - 1) / Math.pow(10, dataScale);
    }
    return Math.pow(10, dataPrecision) - 1;
  }

  /**
   * calculates the min value for numeric types
   * @param dataPrecision
   * @param dataScale
   * @param maxValue
   * @returns
   */
  private calculateMinValue(
    dataPrecision: number,
    dataScale: number,
    maxValue: number
  ): number {
    if (dataScale > 0) {
      return -this.calculateMaxValue(dataPrecision, dataScale);
    }
    return -maxValue;
  }

  private formatInitialValue(input: HTMLInputElement, scale: number): void {
    setTimeout(() => {
      const value = input.value;

      // Don’t format if value is empty or invalid number
      if (!value || isNaN(Number(value))) return;

      const numberValue = parseFloat(value);
      input.value = numberValue.toFixed(scale);
    });
  }
}
