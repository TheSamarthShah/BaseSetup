import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Fileupload, UploadFile } from '../../../../core/components/fileupload/fileupload';
import { Button } from '../../../../core/components/button/button';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'fileupload-demo',
  imports: [Fileupload, CommonModule, Button, MatCardModule],
  templateUrl: './fileupload-demo.html',
  styleUrl: './fileupload-demo.scss'
})
export class FileuploadDemo {
  files: UploadFile[] = [];
  
  ngOnInit() {
    // Dummy DB files
    this.files = [
      { id: Date.now() * 1000 + 1, name: "db_invoice.pdf", size: 24567, isDBSaved: true },
      { id: Date.now() * 1000 + 2, name: "db_report.docx", size: 55678, isDBSaved: true }
    ];
  }

  onFilesChange(updatedFiles: UploadFile[]) {
    this.files = updatedFiles;
  }

  saveFiles() {
    const newFiles = this.files.filter(f => !f.isDBSaved && !f.deleted);
    const deletedFiles = this.files.filter(f => f.isDBSaved && f.deleted);

    console.log("New files:", newFiles);
    console.log("Deleted files:", deletedFiles);

    // TODO: call your API to upload newFiles and delete deletedFiles
  }
}
