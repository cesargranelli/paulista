import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

import { Observable } from 'rxjs/Observable';

import { Rodada } from '../../models/rodada';

@Injectable()
export class RodadaProvider {

  constructor(private _afs: AngularFirestore) { }

  get rodadas(): Observable<Rodada[]> {
    return this._afs.collection<Rodada>('rounds', ref => ref.orderBy('round')).valueChanges();
  }

}
