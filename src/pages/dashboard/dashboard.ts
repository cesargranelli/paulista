import { Component } from '@angular/core';

import { NavParams, LoadingController, Loading } from 'ionic-angular';

import { AngularFirestore } from '@angular/fire/firestore';

import { UserProvider } from './../../providers/user/user';

import { User } from '../../models/user';

@Component({
  selector: 'page-dashboard',
  templateUrl: 'dashboard.html'
})
export class DashboardPage {

  public user: User;

  constructor(
    public db: AngularFirestore,
    public navParams: NavParams,
    public loadingCtrl: LoadingController,
    public userService: UserProvider
  ) { }

  ionViewDidLoad() {

    let loading = this.showLoading();

    this.userService.infoUsuario().subscribe((user: User) => {

      this.user = user;
      loading.dismiss();

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
