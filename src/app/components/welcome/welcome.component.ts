import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '../../utils/utils';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  public getPath(path: string): void {
    const utils = new Utils();

    if (path === undefined || path === '') {
      utils.showSwalError('Ingrese un path');
    } else {
      if (!utils.validatePath(path)) {
        utils.showSwalError('El path ingresado no es válido');
      } else {
        localStorage.setItem('userPath', path);
        this.router.navigate(['/explorer']);
      }
    }
  }

}
