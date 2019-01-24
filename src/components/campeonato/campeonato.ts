import { Component } from '@angular/core';

/**
 * Generated class for the CampeonatoComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'campeonato',
  templateUrl: 'campeonato.html'
})
export class CampeonatoComponent {

  text: string;

  constructor() {
    console.log('Hello CampeonatoComponent Component');
    this.text = 'Hello World';
  }

}
