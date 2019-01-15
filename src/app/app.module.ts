import { BrowserModule } from '@angular/platform-browser';
import { ErrorHandler, NgModule, LOCALE_ID } from '@angular/core';
import { IonicApp, IonicErrorHandler, IonicModule } from 'ionic-angular';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';

import { HttpClientModule } from '@angular/common/http';

import { MyApp } from './app.component';
import { ApostaPage } from '../pages/aposta/aposta';
import { CampeonatoPage } from '../pages/campeonato/campeonato';
import { DashboardPage } from '../pages/dashboard/dashboard';
import { PalpitePage } from '../pages/palpite/palpite';
import { ProfilePage } from '../pages/profile/profile';
import { ResultadoPage } from '../pages/resultado/resultado';
import { SigninPage } from '../pages/signin/signin';
import { SignupPage } from '../pages/signup/signup';

import { AuthProvider } from '../providers/auth/auth';
import { UserProvider } from '../providers/user/user';

import { AngularFireAuthModule } from '@angular/fire/auth';

import { AngularFireModule, FirebaseAppConfig } from '@angular/fire';
import { AngularFirestoreModule } from '@angular/fire/firestore';
import { ResultadoProvider } from '../providers/resultado/resultado';
import { ApostaProvider } from '../providers/aposta/aposta';
import { CampeonatoProvider } from '../providers/campeonato/campeonato';
import { PalpiteProvider } from './../providers/palpite/palpite';
import { RodadaProvider } from '../providers/rodada/rodada';
import { ApostaPalpitesPage } from '../pages/aposta-palpites/aposta-palpites';

const firebaseAppConfig: FirebaseAppConfig = {
  apiKey: 'AIzaSyCiyZ8LHN-jvSgjuXiFN344J67Bh-FyOiE',
  authDomain: 'paulista-7f139.firebaseapp.com',
  databaseURL: 'https://paulista-7f139.firebaseio.com',
  projectId: 'paulista-7f139',
  storageBucket: 'paulista-7f139.appspot.com',
  messagingSenderId: '650483852600'
};

@NgModule({
  declarations: [
    MyApp,
    ApostaPage,
    CampeonatoPage,
    DashboardPage,
    PalpitePage,
    ApostaPalpitesPage,
    ProfilePage,
    ResultadoPage,
    SigninPage,
    SignupPage
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(MyApp),
    AngularFireAuthModule,
    AngularFireModule.initializeApp(firebaseAppConfig),
    AngularFirestoreModule,
    HttpClientModule,
  ],
  bootstrap: [
    IonicApp
  ],
  entryComponents: [
    MyApp,
    ApostaPage,
    CampeonatoPage,
    DashboardPage,
    PalpitePage,
    ApostaPalpitesPage,
    ProfilePage,
    ResultadoPage,
    SigninPage,
    SignupPage
  ],
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'pt'
    },
    AuthProvider,
    StatusBar,
    SplashScreen,
    UserProvider,
    { provide: ErrorHandler, useClass: IonicErrorHandler },
    ResultadoProvider,
    ApostaProvider,
    CampeonatoProvider,
    PalpiteProvider,
    RodadaProvider
  ]
})
export class AppModule { }
