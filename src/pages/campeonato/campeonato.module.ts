import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { CampeonatoPage } from './campeonato';

@NgModule({
  declarations: [
    CampeonatoPage,
  ],
  imports: [
    IonicPageModule.forChild(CampeonatoPage),
  ],
  exports: [
    CampeonatoPageModule
  ]
})
export class CampeonatoPageModule {}
