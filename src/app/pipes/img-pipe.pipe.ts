import { Pipe, PipeTransform } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Pipe({
  name: 'imgPipe'
})
export class ImgPipePipe implements PipeTransform {
  private defaultIcon = '/assets/icons/png/default.png';

  constructor(private httpClient: HttpClient) {}

  transform(url: string): any {
    return this.httpClient.get(url, { responseType: 'blob' }).pipe(
      map (res => {
        return url;
      }),
      catchError(error => {
        // console.log(error);
        return of(this.defaultIcon);
    }));

  }
}
