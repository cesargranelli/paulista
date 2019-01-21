import { Component } from '@angular/core';

import { LoadingController, Loading } from 'ionic-angular';

import { AngularFirestore } from '@angular/fire/firestore';

import { UserProvider } from './../../providers/user/user';
import { CampeonatoProvider } from '../../providers/campeonato/campeonato';

import { User } from '../../models/user';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {

  public user: User;

  constructor(public db: AngularFirestore,
    public loadingCtrl: LoadingController,
    public userService: UserProvider,
    public cam: CampeonatoProvider) { }

  ionViewDidLoad() {
    let loading = this.showLoading();

    this.userService.infoUsuario().subscribe((user: User) => {
      this.user = user;
      loading.dismiss();
     });

     this.cam.verificaStatus().subscribe(dates => {
      if (dates.update) {
        this.cam.ranking();
      }
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
