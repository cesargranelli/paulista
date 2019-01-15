import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

import { User } from './../../models/user';

import { AuthProvider } from './../auth/auth';
import { BaseProvider } from './../base/base';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

@Injectable()
export class UserProvider extends BaseProvider {

  private usuarioLogado: User;

  constructor(
    public db: AngularFirestore,
    public http: HttpClient,
    public authService: AuthProvider
  ) {
    super();
    db.firestore.settings({ timestampsInSnapshots: true });
  }

  create(user: User): Promise<any> {
    return this.db.collection("users").doc(user.uid).set(user);
  }

  userExists(slug: string): Observable<boolean> {
    return this.db.collection('/users', ref =>
      ref.where('slug', '==', slug)
    ).valueChanges().map((users: User[]) => {
      return users.length > 0;
    }).catch(this.handleObservableError);
  }

  obtemUserLogado() {
    return this.usuarioLogado = this.authService.userUid;
  }

  infoUsuario(): Observable<User> {
    return this.db.collection("users").doc<User>(this.authService.userUid).valueChanges();
  }

}
