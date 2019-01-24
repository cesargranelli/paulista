import { AngularFirestore } from '@angular/fire/firestore';
import { CampeonatoProvider } from './../../providers/campeonato/campeonato';
import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, LoadingController, Loading } from 'ionic-angular';
import { Observable } from 'rxjs';

@IonicPage()
@Component({
  selector: 'page-ranking',
  templateUrl: 'ranking.html',
})
export class RankingPage {

  ranking$: Observable<any>;

  i: number = 1;

  constructor(public nav: NavController,
    public par: NavParams,
    public cam: CampeonatoProvider,
    public load: LoadingController,
    private db: AngularFirestore) {
  }

  ionViewDidLoad() {

    let loading: Loading = this.showLoading();

    this.cam.ranking();
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
