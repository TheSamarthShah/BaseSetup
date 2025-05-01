import { Injectable, ApplicationRef } from '@angular/core';
import { signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

export class DataChangeDetectedService {
 dataChangeKBN = signal(false);

  /**
   * updates the value based on the changes in grid
   * dataChangeKBN is for preventing browser reload, back and close cases when there are unsaved changes
   * @param value 
   */
  updateDataChangeKBN(value: boolean) {
    this.dataChangeKBN.set(value);
  }
}
