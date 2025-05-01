import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ActyCommonService {
  /**
   * Converts the given input to a UTC ISO date string.
   *
   * @param input - A Date object or a date string.
   * @param includeTime - Whether to include the time component in the output. Defaults to false.
   * @returns A UTC ISO date string or null if input is invalid.
   */
  getUtcIsoDate = (input: any, includeTime: boolean = false): string | null => {
    if (!input) return null;

    let date: Date;

    if (input instanceof Date) {
      date = input;
    } else {
      date = new Date(input);
      // Return null if the date is invalid
      if (isNaN(date.getTime())) return null;
    }

    // Extract the UTC-relevant parts
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    if (includeTime) {
      // Extract time components if needed
      const hours = date.getHours();
      const minutes = date.getMinutes();
      const seconds = date.getSeconds();
      const millis = date.getMilliseconds();

      // Create a new UTC date with time
      const utcDate = new Date(
        Date.UTC(year, month, day, hours, minutes, seconds, millis)
      );
      return utcDate.toISOString();
    } else {
      // Create a new UTC date without time (00:00:00)
      const utcDate = new Date(Date.UTC(year, month, day));
      return utcDate.toISOString();
    }
  };
}
