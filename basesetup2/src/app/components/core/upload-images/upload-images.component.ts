import {
  Component,
  inject,
  input,
  OnChanges,
  output,
  signal,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FileUpload } from 'primeng/fileupload';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { UPLOAD_IMAGES } from '../../../shared/jp-text';
import { FileUploadDownloadService } from '../../../services/core/file-upload-download.service';

@Component({
  selector: 'app-upload-images',
  imports: [FileUpload, ButtonModule, DialogModule],
  templateUrl: './upload-images.component.html',
  styleUrl: './upload-images.component.scss',
})
export class UploadImagesComponent implements OnChanges {
  @ViewChild(FileUpload) fileuploader!: FileUpload;
  /* services */
  fileUploadDownloadService = inject(FileUploadDownloadService);

  /* inputs */
  isCustomUpload = input<boolean>();
  filePath = input<string>();
  closeDialogInp = input<boolean>();
  Images = input<{ file: File; path: string }[]>([]);
  isDisabled = input<boolean>(false);

  /* output */
  uploadEmmiter = output<any[]>();

  uploadedFiles: any[] = [];
  textContent: any = UPLOAD_IMAGES;
  /*signals*/
  isDialogOpen = signal<boolean>(false);
  commitedImagesCount = signal<number>(0);

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['Images'] && this.Images()) {
      this.commitedImagesCount.set(this.Images().length);
    }
  }
  async onUpload(event: { files: File[] }): Promise<void> {
    const success: { path: string; fileName: string }[] = [];
    let isFailure = false;
    const physicalPath = this.filePath() ?? '';

    for (const file of event.files) {
      this.uploadedFiles.push(file);

      const formData = new FormData();
      formData.append('File', file);
      formData.append('PhysicalPath', physicalPath);

      try {
        await this.fileUploadDownloadService.uploadFile(formData);
        success.push({
          path: physicalPath,
          fileName: file.name,
        });
      } catch (err) {
        isFailure = true;
        break;
      }
    }

    if (isFailure) {
      for (const file of success) {
        const deleteData = new FormData();
        deleteData.append('PhysicalPath', file.path);
        deleteData.append('FileName', file.fileName);

        try {
          await this.fileUploadDownloadService.deleteFile(deleteData);
        } catch (deleteErr) {
          console.error(`Failed to delete ${file.fileName}`, deleteErr);
        }
      }
    } else {
      this.closeDialog();
    }
  }

  onDialogOpen(e: any) {
    this.isDialogOpen.set(true);

    if (this.Images()) {
      const files = this.Images()?.map((img: any) => {
        // If already a File object with type, keep it
        if (img.file instanceof File && img.file.type) {
          return img.file;
        }

        // Otherwise recreate a File with a proper type
        const extension = img.file.name.split('.').pop()?.toLowerCase();
        const mimeTypes: Record<string, string> = {
          pdf: 'application/pdf',
          png: 'image/png',
          jpg: 'image/jpeg',
          jpeg: 'image/jpeg',
          gif: 'image/gif',
          txt: 'text/plain',
          json: 'application/json',
        };
        const mimeType = mimeTypes[extension!] || 'application/octet-stream';

        return new File([img.file], img.file.name, { type: mimeType });
      });

      setTimeout(() => {
        if (this.fileuploader) {
          this.fileuploader.clear();

          // Assign new files (ensure they are File objects)
          if (files && files.length > 0) {
            this.fileuploader.files = [...files];
            this.fileuploader.cd.detectChanges();
          }
        }
      });
    }
  }

  onFilesSelected() {
    if (this.isCustomUpload()) {
      const selectedFilesWithPaths = this.fileuploader.files;

      this.uploadEmmiter.emit(selectedFilesWithPaths);
      this.commitedImagesCount.set(selectedFilesWithPaths.length);
      this.closeDialog();
    }
  }

  closeDialog() {
    this.isDialogOpen.set(false);
    this.fileuploader.clear();
  }

  openFile(event: Event, file: File) {
    event.stopPropagation();

    // 1. Fix missing MIME types (critical!)
    if (!file.type) {
      file = this.fixMissingMimeType(file);
    }

    // 2. Create a blob URL
    const fileUrl = URL.createObjectURL(file);

    // 3. Determine if the file can be previewed
    const isPreviewable = this.isFilePreviewable(file);

    if (isPreviewable) {
      // Open in a new tab using <a> (more reliable than window.open)
      const a = document.createElement('a');
      a.href = fileUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
    } else {
      // Fallback: Download with original filename
      const a = document.createElement('a');
      a.href = fileUrl;
      a.download = file.name;
      a.click();
    }

    // 4. Clean up memory
    setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
  }

  // Helper: Fix missing MIME types
  private fixMissingMimeType(file: File): File {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      gif: 'image/gif',
      txt: 'text/plain',
      json: 'application/json',
    };
    const type = mimeTypes[extension!] || 'application/octet-stream';
    return new File([file], file.name, { type });
  }

  private isFilePreviewable(file: File): boolean {
    const previewableTypes = [
      'image/',
      'application/pdf',
      'text/plain',
      'application/json',
    ];
    return previewableTypes.some((t) => file.type.includes(t));
  }

  removeFile(event: Event, fileToRemove: File): void {
    event.stopPropagation();

    if (this.fileuploader && this.fileuploader.files) {
      this.fileuploader.files = this.fileuploader.files.filter(
        (file: File) => file.name !== fileToRemove.name
      );
      this.fileuploader.cd.detectChanges(); // ensure UI updates
    }
  }
}
