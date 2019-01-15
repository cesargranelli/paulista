import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AlertController, Loading, LoadingController, NavController, NavParams } from 'ionic-angular';

import 'rxjs/add/operator/first';

import { AuthProvider } from '../../providers/auth/auth';
import { UserProvider } from '../../providers/user/user';

import { User } from '../../models/user';

import { DashboardPage } from '../dashboard/dashboard';

@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html',
})
export class SignupPage {

  signupForm: FormGroup;

  email: string = '';
  password: string = '';

  constructor(
    public alertCtrl: AlertController,
    public authService: AuthProvider,
    public formBuilder: FormBuilder,
    public loadingCtrl: LoadingController,
    public navCtrl: NavController,
    public navParams: NavParams,
    public userService: UserProvider
  ) {

    let nicknameRegex = /^[a-zA-Z ]+$/;

    let emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    this.signupForm = this.formBuilder.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      nickname: ['', [Validators.required, Validators.minLength(3), Validators.pattern(nicknameRegex)]],
      email: ['', [Validators.compose([Validators.required, Validators.pattern(emailRegex)])]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.email = this.navParams.get('email');
    this.password = this.navParams.get('password');

  }

  public users: User[];

  onSubmit(): void {

    let formUser = this.signupForm.value;
    let loading: Loading = this.showLoading();
    let nickname: string = formUser.nickname;
    let slug: string = nickname.toLowerCase().replace(" ", "-");
    let foto: string = null;
    let position: number = null;
    let total: number = null;
    let round: number = null;

    this.userService.userExists(slug).first().subscribe((userExists: boolean) => {

        if(!userExists) {

          this.authService.createAuthUser({
            email: formUser.email,
            password: formUser.password
          }).then((authUser: User) => {

            delete formUser.password;

            formUser.uid  = authUser.uid;
            formUser.slug = slug;
            formUser.foto = foto;
            formUser.position = position;
            formUser.total = total;
            formUser.round = round;

            this.userService.create(formUser)
              .then(() => {
                console.log('Usuário cadastrado com sucesso!');
                this.navCtrl.setRoot(DashboardPage, {
                  userid: authUser.uid,
                  slug: slug
                });
                loading.dismiss();
              }).catch((error: any) => {
                console.log(error);
                loading.dismiss();
                this.showAlert(error);
              });

          }).catch((error: any) => {
            console.log(error);
            loading.dismiss();
            this.showAlert(error);
          });

        } else {

          this.showAlert(`O time ${nickname} já está sendo usado em outra conta!`);
          loading.dismiss();

        }

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

  private showAlert(message: string): void {
    this.alertCtrl.create({
      message: message,
      buttons: ['Ok']
    }).present();
  }

}
