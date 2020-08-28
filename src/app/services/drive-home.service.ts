import { Injectable } from '@angular/core';
import { Utils } from '../utils/utils';
import { FileDriveExtend } from '../models/FileDriveExtend';
import { FileDrive } from '../models/FileDrive';
import { environment } from '../../environments/environment';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams, HttpHeaders, HttpResponse } from '@angular/common/http';
import { map } from 'rxjs/operators';


@Injectable({
  providedIn: 'root'
})
export class DriveHomeService {
  private files: FileDriveExtend[];
  httpParams: HttpParams;
  httpHeaders: HttpHeaders;

  constructor(private httpClient: HttpClient) {
    this.files = [];
  }

  public getArrFiles(): FileDriveExtend[] {
    return this.files;
  }

  public getFiles(path: string): Observable<boolean> {
    this.httpParams = new HttpParams();
    this.httpParams = this.httpParams.set('path', path);
    return this.httpClient.get(`${environment.url}/getfiles`, { params: this.httpParams }).pipe(
      map( (response: any) => {
        const files = response.files as FileDrive[];
        const folders = response.directories as FileDrive[];

        this.files = new Utils().convertFDToFDE(files, folders);
        return true;
      })
    );
  }

  public createFolder(path: string, name: string): Observable<any> {
    this.httpParams = new HttpParams();
    this.httpParams = this.httpParams.set('path', path);
    this.httpParams = this.httpParams.set('name', name);

    this.httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    // const body = `path=${path}&name=${name}`;
    return this.httpClient.post(`${environment.url}/createdir`, this.httpParams.toString(), {headers: this.httpHeaders}).pipe(
      map((result: any) => {
        this.files.push(new FileDriveExtend(new FileDrive(name, path), undefined));
        return result;
      })
    );
  }

  public renameElement(path: string, oldName: string, newName: string, index: number): Observable<any> {
    this.httpParams = new HttpParams();
    this.httpParams = this.httpParams.set('path', path);
    this.httpParams = this.httpParams.set('oldName', oldName);
    this.httpParams = this.httpParams.set('newName', newName);

    this.httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.httpClient.put(`${environment.url}/rename`, this.httpParams.toString(), { headers: this.httpHeaders })
    .pipe(
      map((result: any) => {
        this.files[index].fileDrive.name = newName;
        return result;
      })
    );
  }

  public deleteElements(elements: FileDriveExtend[]): Observable<any> {
    const elementsTmp = [];
    elements.forEach(file => {
      elementsTmp.push(file.fileDrive);
    });
    this.httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    return this.httpClient.post(`${environment.url}/delete`, elementsTmp, { headers: this.httpHeaders })
    .pipe(
      map( result => {
        elements.forEach(item => {
          for (let i = 0; i < this.files.length; i++) {
            if (item.fileDrive.name === this.files[i].fileDrive.name && item.extension === this.files[i].extension) {
              this.files.splice(i, 1);
              break;
            }
          }
        });
        return result;
      })
    );
  }

  public downloadSingleElement(element: FileDriveExtend): Observable<any> {
    this.httpParams = new HttpParams();
    this.httpParams = this.httpParams.set('path', element.fileDrive.path);
    this.httpParams = this.httpParams.set('name', element.fileDrive.name);

    this.httpHeaders = new HttpHeaders().set('Content-Type', 'application/x-www-form-urlencoded');
    return this.httpClient.get(`${environment.url}/download/single`,
    { params: this.httpParams, headers: this.httpHeaders, responseType: 'blob' });
  }

  public downloadElements(elements: FileDrive[]): Observable<any> {
    this.httpHeaders = new HttpHeaders({'Content-Type': 'application/json'});
    return this.httpClient.post(`${environment.url}/download`, elements, { headers: this.httpHeaders, responseType: 'blob' });
  }

  public uploadElements(filesUpload: File[], path: string, option: string): Observable<any> {
    const formData = new FormData();

    for (const f of filesUpload) {
      formData.append('files', f);
    }
    formData.append('path', path);

    if (option === 'files') {
      return this.httpClient.post(`${environment.url}/upload`, formData);
    } else if (option === 'folder') {
      return this.httpClient.post(`${environment.url}/uploaddirectory`, formData);
    }
  }

}
