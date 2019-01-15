import { Component } from "@angular/core";

import { IonicPage, NavController, NavParams } from "ionic-angular";

import { AngularFirestore } from '@angular/fire/firestore';

import { User } from '../../models/user';

@IonicPage()
@Component({
  selector: "page-profile",
  templateUrl: "profile.html"
})
export class ProfilePage {

  public foto: string = "false";
  public nome: string;
  public email: string;
  public nick: string;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public db: AngularFirestore
  ) { }

  ionViewDidLoad() {

    this.db
      .collection("users")
      .doc(this.navParams.get('userid'))
      .valueChanges()
      .first()
      .subscribe((user: User) => {
        this.nome = user.name;
        this.email = user.email;
      });
  }

}
