import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';

import { AngularFirestore } from '@angular/fire/firestore';

import { ApostaProvider } from '../../providers/aposta/aposta';
//import { PalpitePage } from '../palpite/palpite';
import { ApostaPalpitesPage } from '../aposta-palpites/aposta-palpites';

@IonicPage()
@Component({
  selector: 'page-aposta',
  templateUrl: 'aposta.html',
})
export class ApostaPage {

  apostas;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public ap: ApostaProvider,
    public db: AngularFirestore
  ) { }

  ionViewDidLoad() {
    this.apostas = this.ap.apostas(this.navParams.get('jogo'));
  }

  palpites(aposta) {
    this.navCtrl.push(ApostaPalpitesPage, {
      aposta: aposta
    });
  }

}
