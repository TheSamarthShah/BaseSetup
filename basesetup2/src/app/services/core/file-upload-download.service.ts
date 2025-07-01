import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { MessageService } from 'primeng/api';
import { API_ENDPOINTS } from '../../shared/api-endpoint';
import { INFOMSG } from '../../shared/messages';

@Injectable({
  providedIn: 'root',
})
export class FileUploadDownloadService {
  http = inject(HttpClient);
  messageService = inject(MessageService);

  //This API call for the get file data
  fileDataGet(): Observable<any> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.FILEUPLOADDOWNLOAD.FILEDATAGET
    }`;
    const physicalFilePath = API_ENDPOINTS.CORE.FILEUPLOADDOWNLOAD.PHYSICALPATH;
    const formData = new FormData();
    formData.append('PhysicalPath', physicalFilePath);
    return this.http.post(url, formData);
  }

  //This API call for the upload file
  private uploadFileCall(fileData: FormData): Observable<any> {
    const fileUpload = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.FILEUPLOADDOWNLOAD.FILEUPLOAD
    }`;
    return this.http.post(fileUpload, fileData);
  }

  //This API call for the delete file
  private deleteFileCall(fileData: FormData): Observable<any> {
    const fileDelete = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.FILEUPLOADDOWNLOAD.FILEDELETE
    }`;
    return this.http.post(fileDelete, fileData);
  }

  //This API call for the download file
  downloadFileCall(fileData: FormData): Observable<Blob> {
    const url = `${
      API_ENDPOINTS.BASE + API_ENDPOINTS.CORE.FILEUPLOADDOWNLOAD.FILEDOWNLOAD
    }`;
    return this.http.post(url, fileData, { responseType: 'blob' }).pipe(
      map((blob) => {
        // if the file is empty then show message and throw error so that file wont be downloaded
        // Need to do the check here because for blob data we need to specify { responseType: 'blob' } and if we do that we can't pass json.
        // If we pass json then .subscribe will give error.
        if (!blob || blob.size === 0) {
          this.messageService.add({
            severity: 'info',
            summary: INFOMSG.I0001,
            life: 2000,
          });
          throw new Error('No file received from server');
        }
        return blob;
      })
    );
  }

  async uploadFile(fileData: FormData): Promise<void> {
    await new Promise((resolve, reject) => {
      this.uploadFileCall(fileData).subscribe({
        next: (res) => {
          resolve(res);
        },
      });
    });
  }

  async deleteFile(fileData: FormData) {
    await new Promise((resolve, reject) => {
      this.deleteFileCall(fileData).subscribe({
        next: (res) => {
          resolve(res);
        },
      });
    });
  }

  downloadFile(fileData: FormData, fileName: string) {
    this.downloadFileCall(fileData).subscribe({
      next: (res) => {
        if (res) {
          const blob = new Blob([res], { type: 'application/octet-stream' });
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = fileName;
          a.click();
          window.URL.revokeObjectURL(url);
        }
      },
    });
  }

  async prepareBlobsFromServer(filePaths: string[]): Promise<Blob[]> {
    if (!filePaths || filePaths.length === 0) {
      return [];
    }

    const blobList: Blob[] = [];

    for (const filePath of filePaths) {
      const formData = new FormData();

      formData.append('PhysicalPath', filePath);
      formData.append('FileName', '');
      try {
        const blob = await lastValueFrom(this.downloadFileCall(formData));
        blobList.push(blob);
      } catch (err) {}
    }

    return blobList;
  }

  extractFileName(path: string): string {
    return path.split('/').pop() || 'unknown';
  }

  resizeImageElement(
    img: HTMLImageElement,
    targetWidth: number,
    targetHeight: number
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) return reject('Could not get canvas context');

      // Fill canvas with white background if needed (optional)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, targetWidth, targetHeight);

      // Draw image scaled to fit fixed dimensions (may stretch or shrink)
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      const dataURL = canvas.toDataURL('image/png');
      resolve(dataURL.replace(/^data:image\/png;base64,/, ''));
    });
  }

  async processImage(
    blob: Blob,
    mainWidth: number,
    mainHeight: number,
    thumbWidth: number,
    thumbHeight: number
  ): Promise<{
    originalUrl: string;
    resizedUrl: string;
    thumbnailUrl: string;
  }> {
    const originalUrl = URL.createObjectURL(blob);

    const loadImage = (url: string) =>
      new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = (e) => reject(e);
        img.src = url;
      });

    const resizeImage = (
      img: HTMLImageElement,
      width: number,
      height: number
    ): string => {
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      ctx.fillStyle = '#fff';
      ctx.fillRect(0, 0, width, height);

      ctx.drawImage(img, 0, 0, width, height);
      return canvas.toDataURL('image/png');
    };

    const imgElement = await loadImage(originalUrl);

    const resizedUrl = resizeImage(imgElement, mainWidth, mainHeight);
    const thumbnailUrl = resizeImage(imgElement, thumbWidth, thumbHeight);

    return {
      originalUrl,
      resizedUrl,
      thumbnailUrl,
    };
  }
}
