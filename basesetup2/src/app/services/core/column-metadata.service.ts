import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, ReplaySubject, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { ColumnMetadata } from '../../model/core/column-metadata.type';
import { API_ENDPOINTS } from '../../shared/api-endpoint';

@Injectable({
  providedIn: 'root', // Provided in the root injector
})
/**
 * Service for getting column's metadata.
 * Column meta data contailns things like length, max value and type for perticular column.
 * This data is mainly used for input checks for the column.(Like length for perticular string type column or only take number inputs for number type columns)
 */
export class ColumnMetadataService {
  private apiUrl = `${
    API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.COLUMNMETADATA.GET
  }`;
  private metadataCache$ = new ReplaySubject<ColumnMetadata[]>(1); // Cache metadata

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
          if (res.Code === 200) {
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
}
