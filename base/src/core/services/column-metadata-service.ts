import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {CORE_CONFIG } from '../core.config.token'; 
import { ColumnMetadata } from '../models/column-metadata.type';

@Injectable({
  providedIn: 'root'
})
export class ColumnMetadataService {
     coreConfig = inject(CORE_CONFIG);

  private apiUrl = this.coreConfig.getColumnMetaDataAPI;
 
  private metadataCache$ = new ReplaySubject<ColumnMetadata[]>(1); // Cache metadata
  private localMetadata: ColumnMetadata[] = [];

  constructor(private http: HttpClient) {
    this.loadMetadata();
  }

  /**
   * Loads the meta data and stores it in cache memory of the application
   */
  private loadMetadata(): void {
    // Use POST instead of GET
    this.http
      .post<ColumnMetadata[]>(this.apiUrl, {}) // Add request body if required
      .pipe(
        tap((res: any) => {          
          if (res.Messagecode === null && res.Message === null){
            this.localMetadata = res.Data.metaData;
            this.metadataCache$.next(res.Data.metaData);            
            }          
        }),
        catchError((err) => {
          this.metadataCache$.error(err); // Propagate the error
          return of([]); // Return an empty array as a fallback
        })
      )
      .subscribe();
  }

  /**
   *
   * @returns the metadata from the cache
   */
  getColumnMetadata(): Observable<ColumnMetadata[]> {
    return this.metadataCache$.asObservable();
  }

  getSingleColumnMetadata(column: {
    name: string;
    tableName: string;
  }): ColumnMetadata | undefined {
    return this.localMetadata.find(
      (meta) =>
        meta.ColumnName.toLowerCase() === column.name.toLowerCase() &&
        meta.TableName.toLowerCase() === column.tableName.toLowerCase()
    );
  }
}
