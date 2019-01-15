import { NgModule } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { PalpitePage } from './palpite';

@NgModule({
  declarations: [
    PalpitePage,
  ],
  imports: [
    IonicPageModule.forChild(PalpitePage),
  ],
  exports: [
    PalpitePageModule
  ]
})
export class PalpitePageModule {}
