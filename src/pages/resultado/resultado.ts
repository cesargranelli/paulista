import { Component } from '@angular/core';

import { Loading, LoadingController, IonicPage, NavController, NavParams } from 'ionic-angular';

import { ApostaPage } from '../aposta/aposta';

import { AngularFirestore } from '@angular/fire/firestore';

import { Observable } from 'rxjs/Observable';
import { ResultadoProvider } from '../../providers/resultado/resultado';

@IonicPage()
@Component({
  selector: 'page-resultado',
  templateUrl: 'resultado.html',
})
export class ResultadoPage {

  selectDefault: string = 'RODADA 1';

  rounds$: Observable<any>;
  jogos$: Observable<any>;

  dateNow: string = new Date(new Date().setSeconds(-10800)).toISOString().substr(0, 10).replace(/[- ]/g, '');

  constructor(public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFirestore,
    public loadingCtrl: LoadingController,
    public rs: ResultadoProvider) { }

  ionViewDidLoad() {

    let loading: Loading = this.showLoading();

    this.rounds$ = this.db.collection('rounds', ref => ref.orderBy('round')).valueChanges();
    this.jogos$ = this.rs.resultados(this.selectDefault);

    setTimeout(() => {
      loading.dismiss();
    }, 1000);

  }

  partidas(id) {

    let loading: Loading = this.showLoading();

    this.jogos$ = this.rs.resultados(id);

    setTimeout(() => {
      loading.dismiss();
    }, 2000);
  }

  apostas(jogo) {
    this.navCtrl.push(ApostaPage, {
      jogo: jogo
    });
  }

  private showLoading(): Loading {
    let loading: Loading = this.loadingCtrl.create({
      content: 'Por favor aguarde...'
    });

    loading.present();

    return loading;
  }

}
