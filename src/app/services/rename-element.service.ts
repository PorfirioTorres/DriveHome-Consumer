import { Injectable } from '@angular/core';
import { DriveHomeService } from './drive-home.service';
import { FileDriveExtend } from '../models/FileDriveExtend';

@Injectable({
  providedIn: 'root'
})
export class RenameElementService {
  private modalRename: boolean;
  private indexElement: number;
  private path: string;
  private oldName: string;
  private fileDriveExtend: FileDriveExtend;

  constructor(private driveHomeService: DriveHomeService) {
    this.modalRename = false;
  }

  public getModalRename(): boolean {
    return this.modalRename;
  }

  public getOldName(): string {
    return this.oldName;
  }

  public getIndexElement(): number {
    return this.indexElement;
  }

  public getPath(): string {
    return this.path;
  }

  public getFile(): FileDriveExtend {
    return this.fileDriveExtend;
  }

  public openModal(): void {
    this.modalRename = true;
  }

  public closeModal(): void {
    this.modalRename = false;
    this.indexElement = undefined;
    this.path = undefined;
    this.oldName = undefined;
  }

  public setValues(index: number, path: string): void {
    this.indexElement = index;
    this.path = path;
    this.fileDriveExtend = this.driveHomeService.getArrFiles()[index];
    this.oldName = this.fileDriveExtend.fileDrive.name;
  }

}
