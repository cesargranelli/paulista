import { Component, ViewChild } from '@angular/core';
import { Platform, Nav } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { RankingPage } from '../pages/ranking/ranking';
import { PalpitePage } from '../pages/palpite/palpite';
import { ProfilePage } from '../pages/profile/profile';
import { ResultadoPage } from '../pages/resultado/resultado';
import { SigninPage } from '../pages/signin/signin';

import { UserProvider } from './../providers/user/user';

@Component({
  selector: 'myapp',
  templateUrl: 'app.html'
})
export class MyApp {

  rootPage: any = SigninPage;

  @ViewChild(Nav) public nav: Nav;

  public paginas = [
    { titulo: 'Perfil', componente: ProfilePage, icone: 'person' },
    { titulo: 'Palpite', componente: PalpitePage, icone: 'clipboard' },
    { titulo: 'Resultado', componente: ResultadoPage, icone: 'paper' },
    { titulo: 'Ranking', componente: RankingPage, icone: 'flag' },
    { titulo: 'Sair', componente: SigninPage, icone: 'log-out' }
  ];

  constructor(
    public platform: Platform,
    public statusBar: StatusBar,
    public splashScreen: SplashScreen,
    public userService: UserProvider
  ) {
    platform.ready().then(() => {
      statusBar.styleDefault();
      splashScreen.hide();
    });
  }

  onPage(componente, titulo) {
    let signout = false;
    (titulo == "Sair") ? signout = true : null;
    this.nav.push(componente, {
      userid: this.nav._views[0].data.userid,
      slug: this.nav._views[0].data.slug,
      out: signout
    });
  }

}