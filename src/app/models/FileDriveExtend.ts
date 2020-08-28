import { FileDrive } from './FileDrive';

export class FileDriveExtend {
    fileDrive: FileDrive;
    extension: string;

    constructor(fileDrive: FileDrive, extension: string) {
        this.fileDrive = fileDrive;
        this.extension = extension;
    }
}
