import { Component, OnInit } from '@angular/core';
import { RenameElementService } from '../../services/rename-element.service';
import { DriveHomeService } from '../../services/drive-home.service';
import { Utils } from '../../utils/utils';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-rename-element',
  templateUrl: './rename-element.component.html',
  styleUrls: ['./rename-element.component.css']
})
export class RenameElementComponent implements OnInit {

  constructor(public renameElementService: RenameElementService, private driveHomeService: DriveHomeService) { }

  ngOnInit(): void {
  }

  public closeModal(): void {
    this.renameElementService.closeModal();
  }

  public upadteName(newName: string): void {
    const utils = new Utils();
    newName = newName.trim();

    if (newName === undefined || newName.length === 0) {
      utils.showSwalError('Ingrese un nombre válido');
    } else {
      const fde = this.renameElementService.getFile();
      let nameToFile: string;

      if (fde.extension === undefined) { // es una carpeta
        nameToFile = newName;
      } else { // es un archivo, agregar su extension al nombre
        nameToFile = `${newName}.${fde.extension}`;
      }

      const files = this.driveHomeService.getArrFiles();
      let exists = false;

      for (const file of files) {
        if (file.fileDrive.name.toLowerCase() === nameToFile.toLowerCase()
            && file.extension === fde.extension) {
            exists = true;
            break;
        }
      }

      if (exists) {
        utils.showSwalError('Ya existe un elemento con el nombre ' + nameToFile);
      } else{
        const path = this.renameElementService.getPath();
        const oldName = this.renameElementService.getOldName();
        const index = this.renameElementService.getIndexElement();

        this.renameElementService.closeModal();
        utils.showLoading('Renombrando elemento...');
        this.driveHomeService.renameElement(path, oldName, nameToFile, index).subscribe(
          result => {
            Swal.close();
            utils.showSwalSuccess(result.success);
          },
          err => {
            Swal.close();
            utils.showSwalError(err.error.message);
          }
        );
      }
    }
  }

}
