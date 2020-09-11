import { FileDrive } from '../models/FileDrive';
import { FileDriveExtend } from '../models/FileDriveExtend';
import Swal from 'sweetalert2';

export class Utils {
    constructor() {}

    public getExtension(name: string): string {
       const nameTokens = name.split('.');
       return nameTokens[nameTokens.length - 1];
    }

    public navigateUpPath(path: string): string {
        const pathTokens = path.split('/');
        pathTokens.pop();
        let newPath = '';
        for (let i = 0; i < pathTokens.length; i++) {
            if (i < pathTokens.length - 1) {
                newPath += pathTokens[i] + '/';
            } else {
                newPath += pathTokens[i];
            }
        }

        return newPath;
    }

    public validatePath(path: string): boolean {
        const regex = new RegExp('^(.+)\/([^/]*)$');

        return regex.test(path);
    }

    public convertFDToFDE(files: FileDrive[], folders: FileDrive[]): FileDriveExtend[] {
        const fileDriveExtend = [];

        folders.forEach(folder => {
            fileDriveExtend.push(new FileDriveExtend(folder, undefined));
        });
        files.forEach(file => {
            fileDriveExtend.push(new FileDriveExtend(file, this.getExtension(file.name)));
        });
        return fileDriveExtend;
    }

    public showLoading(titleSwal: string): void {
        Swal.fire({
          title: titleSwal,
          imageUrl: '/assets/icons/icon-font/loading.gif',
          imageAlt: 'processing',
          showConfirmButton: false,
          allowOutsideClick: false
        });
    }

    public showSwalSuccess(message: string): void {
        Swal.fire('Éxito', message, 'success');
    }

    public showSwalError(message: string): void {
        Swal.fire('Error', message, 'error');
    }
}
