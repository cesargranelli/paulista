import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AngularFireAuth } from '@angular/fire/auth';
import { UserCredential } from 'firebase/auth';
import { BaseProvider } from './../base/base';

@Injectable()
export class AuthProvider extends BaseProvider {

  constructor(
    public angularFireAuth: AngularFireAuth,
    public http: HttpClient
  ) {
    super();
  }

  createAuthUser(user: { email: string, password: string }): Promise<UserCredential> {
    return this.angularFireAuth.auth.createUserWithEmailAndPassword(user.email, user.password);
  }

  signin(userLogin: { email: string, password: string }): Promise<any> {
    return this.angularFireAuth.auth.signInWithEmailAndPassword(userLogin.email, userLogin.password);
  }

  signout(): Promise<void> {
    return this.angularFireAuth.auth.signOut();
  }

  get authenticated(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.angularFireAuth.authState
        .subscribe(isAuthenticated => {
          (isAuthenticated) ? resolve(true) : reject(false);
        });
    });
  }

  get userUid(): any {
    return this.angularFireAuth.auth.currentUser.uid;
  }

}
