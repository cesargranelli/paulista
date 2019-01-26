//import { map } from 'rxjs/operator/map';
import { Component, Injectable } from '@angular/core';

import { IonicPage, NavController, NavParams, Loading, LoadingController } from 'ionic-angular';

import { AngularFirestore } from '@angular/fire/firestore';

//import { RodadaProvider } from './../../providers/rodada/rodada';
import { CampeonatoProvider } from '../../providers/campeonato/campeonato';
import { Observable } from 'rxjs/Observable';
//import { Usuario } from '../../models/usuario';
import { Rodada } from '../../models/rodada';
//import { User } from '../../models/user';

@Injectable()
@IonicPage()
@Component({
  selector: 'page-campeonato',
  templateUrl: 'campeonato.html',
})
export class CampeonatoPage {

  private _rodadas: Rodada[];

  ranking$: Observable<any>;

  i: number = 1;

  constructor(public nav: NavController,
    public par: NavParams,
    //private _rod: RodadaProvider,
    public cam: CampeonatoProvider,
    public load: LoadingController,
    private db: AngularFirestore) { }

  executar() {
    console.log('Rodadas: ' + this._rodadas);
  }

  ionViewDidLoad() {

    let loading: Loading = this.showLoading();
    //let hoje = new Date(new Date().setSeconds(-10800)).getTime();
/*
    this.cam.verificaStatus().subscribe(dates => {

      if ((hoje - Number(dates.value)) > 3600000 || !dates) {
*/
        //this.cam.ranking();
/*
        this.db.collection("ranking").valueChanges().subscribe((rankings: any) => {
          rankings.map((ranking: any) => {
            this.db.collection("campeonato").doc(ranking.uid).set({
              datetime: new Date(new Date().setSeconds(-10800)).getTime(),
              nick: ranking.nick,
              rodada: ranking.atual,
              slug: ranking.slug,
              total: ranking.rodada1 +
                     ranking.rodada2 +
                     ranking.rodada3 +
                     ranking.oitavas +
                     ranking.quartas +
                     ranking.semifinal +
                     ranking.final +
                     ranking.atual,
              uid: ranking.uid
            });
          });
        });

        this.db.collection("status").doc("datetime").set({
          value: new Date(new Date().setSeconds(-10800)).getTime(),
          datetime: new Date(new Date().setSeconds(-10800)).toISOString()
        }).then(() => loading.dismiss());

      }

    });

    let i = 1;

    this.db.collection("campeonato", ref => ref.orderBy("total", "desc"))
      .valueChanges().first().subscribe((rankings: any) => {
        rankings.map((ranking: any) => {
          this.db.collection("users").doc(ranking.uid).update({
            round: ranking.rodada,
            total: ranking.total,
            position: i
          });
          i++
        });
      });
*/
    this.ranking$ = this.db.collection("ranking", ref => ref.orderBy("total", "desc")).valueChanges();

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

  }

  private showLoading(): Loading {
    let loading: Loading = this.load.create({
      content: 'Por favor aguarde...'
    });

    loading.present();

    return loading;
  }

}
