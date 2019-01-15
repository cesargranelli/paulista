import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

import { Aposta } from '../../models/aposta';
import { User } from '../../models/user';

@Injectable()
export class ApostaProvider {

  apostas$ = [];

  constructor(
    public http: HttpClient,
    public db: AngularFirestore
  ) { }

  apostas(jogo) {

    let i = 0;

    this.db.collection("users").valueChanges().subscribe(users => {
      users.map((user: User) => {
        this.db.collection("hunches").doc(user.slug).collection(String(jogo.round)).doc(String(jogo.id))
        .valueChanges().subscribe((game: Aposta) => {
          if (game) {
            game.nickname = user.nickname;
            game.update = new Date(Number(game.update)).toLocaleString();
            this.apostas$[i++] = game;
          }
        });
      });
    });

    return this.apostas$;

  }

  palpites(aposta: Aposta) {

    return this.db.collection("hunches").doc(aposta.slug).collection(String(aposta.round)).doc(String(aposta.id))
        .valueChanges();

  }

}
