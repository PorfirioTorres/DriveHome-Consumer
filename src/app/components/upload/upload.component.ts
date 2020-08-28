import { Component, OnInit, Input} from '@angular/core';
import { FormsUploadService } from '../../services/forms-upload.service';
import { DriveHomeService } from '../../services/drive-home.service';
import { Utils } from '../../utils/utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.css']
})
export class UploadComponent implements OnInit {
  @Input() path: string;
  filesUpload: File[];
  option: string;

  constructor(public formsUploadService: FormsUploadService, private driveHomeService: DriveHomeService) {
    this.filesUpload = [];
   }

  ngOnInit(): void {
  }

  public closeModal(): void {
    this.formsUploadService.closeForm();
  }

  public filesSelected(event: any): void {
    this.filesUpload = [];
    this.filesUpload = event.target.files;
    this.option = 'files';
  }

  public folderSelected(event: any): void {
    this.filesUpload = [];
    this.filesUpload = event.target.files;
    this.option = 'folder';
  }

  public upload(): void {
    const utils = new Utils();
    if (this.filesUpload.length === 0) {
      utils.showSwalError('No ha selecionado ningun elemento');
    } else {
      this.formsUploadService.closeForm();
      utils.showLoading('Subiendo elementos...');
      this.driveHomeService.uploadElements(this.filesUpload, this.path, this.option).subscribe(
        result => {
          Swal.close();
          // utils.showSwalSuccess(result.sucess);
          utils.showLoading('Cargando contenido...');
          this.driveHomeService.getFiles(this.path).subscribe(
            response => {
              Swal.close();
            },
            err => {
              Swal.close();
              utils.showSwalError('Ocurrió un error al cargar los elementos, recargue la pagina.');
            }
          );
        },
        err => {
          Swal.close();
          utils.showSwalError(err.error.message);
          this.driveHomeService.getFiles(this.path).subscribe(
            response => console.log(response),
            err2 => {
              utils.showSwalError('Ocurrió un error al cargar los elementos, recargue la pagina.');
            }
          );
        }
      );
      this.filesUpload = [];
    }
  }

}
