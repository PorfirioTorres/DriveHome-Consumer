import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class FormsUploadService {
  public files: boolean;
  public folder: boolean;

  constructor() {
    this.files = false;
    this.folder = false;
  }

  public closeForm(): void {
    this.files = false;
    this.folder = false;
  }

  public openForm(form: string): void {
    if (form === 'files' && this.folder === false) {
      this.files = true;
    } else {
      if (form === 'folder' && this.files === false) {
        this.folder = true;
      }
    }
  }
}
