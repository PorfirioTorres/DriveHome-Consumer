import { Component, OnInit, HostListener, ViewChild } from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';

import { DriveHomeService } from '../../services/drive-home.service';
import { FormsUploadService } from '../../services/forms-upload.service';
import { RenameElementService } from '../../services/rename-element.service';
import { Utils } from '../../utils/utils';

import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-explorer',
  templateUrl: './explorer.component.html',
  styleUrls: ['./explorer.component.css']
})

export class ExplorerComponent implements OnInit {
  @ViewChild(MatMenuTrigger) contextMenu: MatMenuTrigger;

  contextMenuPosition = { x: '0px', y: '0px' };

  mcOptions: string[];

  itemsSelected: number[];
  path: string;
  pathBase: string;

  constructor(private formsUploadService: FormsUploadService, public driveHomeService: DriveHomeService,
              private renameElementService: RenameElementService) {

    this.itemsSelected = [];
  }

  ngOnInit(): void {
    // ========lanza la busqueda de archivos en el path actual==========
    this.pathBase = 'c:/cloud';
    this.path = this.pathBase;
    this.getFiles(this.path);
  }

  public getFiles(pathParam: string): void {
    const utils = new Utils();
    if (new Utils().validatePath(pathParam)) {
      utils.showLoading('Cargando contenido...');
      this.driveHomeService.getFiles(pathParam).subscribe(
        result => {
          this.path = pathParam;
          Swal.close();
        },
        err => {
          Swal.close();
          utils.showSwalError(err.error.message);
        }
      );
    } else {
      utils.showSwalError('El path no es válido');
    }
  }

  public openForm(modal: string): void {
    // el valor de modal es el gormulario que se quiere abrir files o folder
    this.formsUploadService.openForm(modal);
  }
  // mostrar/ocultar la caja para poner nombre al folder
  public toggleNameFolder(): void {
    const txtNameFolder = document.getElementById('txtNameFolder') as HTMLInputElement;
    if (txtNameFolder.style.display === 'none') {
      txtNameFolder.style.display = 'block';
    } else {
      if (txtNameFolder.style.display === 'block') {
        txtNameFolder.style.display = 'none';
      }
    }
  }

  public execMenuCOption(option: string): void {
    if (option === 'Renombrar') {
      this.renameElement();
    } else if (option === 'Borrar') {
      this.deleteElements();
    } else if (option === 'Descargar') {
      this.downloadElements();
    }
  }
  // =======lanza navegar una carpeta arriba=======
  public navigateUp(): void {
    if (this.path === this.pathBase) { // ya no ir mas arriba
      return;
    }

    const utils = new Utils();
    const pathTmp = utils.navigateUpPath(this.path);

    this.getFiles(pathTmp);
  }
  // ==========lanza la apertura de un folder======
  public openFolder(event: any): void {
    const indexElement = event.target.dataset.value;
    const fde = this.driveHomeService.getArrFiles()[indexElement];

    const pathTmp =  `${this.path}/${fde.fileDrive.name}`;
    this.getFiles(pathTmp);
  }
  // =========lanza la descarga de elementos========
  public downloadElements(): void {
    const utils = new Utils();
    const elements = [];

    if (this.itemsSelected.length === 1) {
      elements.push(this.driveHomeService.getArrFiles()[this.itemsSelected[0]]);
    } else {
      this.itemsSelected.forEach(item => {
        elements.push(this.driveHomeService.getArrFiles()[item].fileDrive);
      });
    }
    utils.showLoading('Descargando los archivos...');
    if (elements.length === 1) {
      this.driveHomeService.downloadSingleElement(elements[0]).subscribe(
        result => {
          Swal.close();
          const blob = new Blob([result], {type: 'text/json; charset=utf-8'});
          saveAs(blob, elements[0].fileDrive.name);
        },
        err => {
          Swal.close();
          utils.showSwalError(err.error.message);
        }
      );
    } else if (elements.length > 1) {
      this.driveHomeService.downloadElements(elements).subscribe(
        result => {
          Swal.close();
          const blob = new Blob([result], {type: 'blob'});
          saveAs(blob, 'files.zip');
        },
        err => {
          Swal.close();
          utils.showSwalError('Ocurrió un error al intentar descargar los archivos');
        }
      );
    }
  }
  // =======lanza la creacion de un folder==========
  public createFolder(name: string): void {
    const utils = new Utils();
    let exists = false;
    name = name.trim();
    if (name === undefined || name.length === 0) {
      utils.showSwalError('El nombre ingresado no es válido');
    } else {
      for (const file of this.driveHomeService.getArrFiles()) {
        if (file.extension === undefined && file.fileDrive.name === name) {
          exists = true;
          break;
        }
      }
      if (exists) {
        utils.showSwalError('Ya hay un elemento con el nombre ' + name);
      } else {
        utils.showLoading('Creando Folder...');
        this.driveHomeService.createFolder(this.path, name).subscribe(
          result => {
            Swal.close();
            utils.showSwalSuccess(result.success);
          },
          err => {
            console.log(err);
            Swal.close();
            utils.showSwalError(err.error.message);
          }
        );
      }
    }
  }
  // =======lanza el formulario de cambio de nombre a un elemento==========
   private renameElement(): void {
    const index = this.itemsSelected[0];
    this.renameElementService.setValues(index, this.path);
    this.renameElementService.openModal();
   }

   // ===========lanza la eliminacion de elementos===============
   private deleteElements(): void {
    Swal.fire({
      title: '¿Desea eliminar los elementos selccionados?',
      // text: 'You wont be able to revert this!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Si, borrar'
    }).then((result) => {
      if (result.value) {
        const utils = new Utils();
        const elementsToDelete = [];

        this.itemsSelected.forEach(item => {
          elementsToDelete.push(this.driveHomeService.getArrFiles()[item]);
        });
        utils.showLoading('Eliminando...');
        this.driveHomeService.deleteElements(elementsToDelete).subscribe(
           success => {
            Swal.close();
            Swal.fire(
              '¡Eliminados!',
              'Los elementos se han eliminado.',
              'success'
            );
            this.itemsSelected = [];
          },
          err => {
            Swal.close();
            utils.showSwalError(err.error.message);
          }
        );
      }
    });
   }

  ///////////////////////////////////////////////////////////////////////////////////////////
  // al item que se le dio click agregarle una clase para resaltarlo
  public selectItem(event: any): void {
    event.stopPropagation();

    if (event.ctrlKey) {
      // al dar click tiene la clase, quitar la clase y quitar de la lista de seleccionados
      if (event.target.classList.contains('bg-file-selected')) {
        const index = this.searchSelected(event.target.dataset.value);
        if (index > -1) {
          this.itemsSelected.splice(index, 1);
        }
      } else { // no tiene la clase, agregar a la lista de seleccionados
        this.itemsSelected.push(event.target.dataset.value);
      }

      event.target.classList.toggle('bg-file-selected');
    } else {
      if (this.itemsSelected.length > 0) { // hay elementos seleccionados
        this.toggleSelectAll(0);
      }

      event.target.classList.add('bg-file-selected');
      this.itemsSelected.push(event.target.dataset.value);
    }
  }

  // quitar la clase de 'seleccion' a todos los items
  public unSelect(): void {
    this.toggleSelectAll(0);
  }

  @HostListener('window:keydown', ['$event'])
  public selectAll(event: any): void {
    if (event.ctrlKey && event.key === 'b') {
      this.toggleSelectAll(1);
    }
  }

  public rightClick(event: any): void {
    event.preventDefault();
    if (!event.target.classList.contains('bg-file-selected')) { // el elemento clickeado no estaba seleccionado
      this.toggleSelectAll(0);
      event.target.classList.add('bg-file-selected');
      this.itemsSelected.push(event.target.dataset.value);
    }

    if ( this.itemsSelected.length === 1) {
      this.mcOptions = ['Borrar', 'Descargar', 'Renombrar'];
    } else if (this.itemsSelected.length > 1) {
      this.mcOptions = ['Borrar', 'Descargar'];
    }
    // abrir el menu
    this.contextMenuPosition.x = event.clientX + 'px';
    this.contextMenuPosition.y = event.clientY + 'px';
    this.contextMenu.menu.focusFirstItem('mouse');
    this.contextMenu.openMenu();
  }

  private toggleSelectAll(offon: number): void {
    const items = document.querySelectorAll('.file');

    this.itemsSelected = [];

    items.forEach((item: HTMLInputElement) => {
      if (offon === 1) { // seleccionar
        item.classList.add('bg-file-selected');
        this.itemsSelected.push(Number(item.dataset.value));
      } else if (offon === 0) { // desseleccionar
        item.classList.remove('bg-file-selected');
      }
    });
  }

  private searchSelected(value: number): number {
    for (let i = 0; i < this.itemsSelected.length; i++) {
      if (this.itemsSelected[i] === value) {
        return i;
      }
    }

    return -1;
  }

}
