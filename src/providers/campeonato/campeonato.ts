import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

//import { Observable } from 'rxjs/Observable';
import 'rxjs/operator/first';

import { Partida } from '../../models/partida';
import { Rodada } from '../../models/rodada';
import { User } from '../../models/user';
import { Aposta } from '../../models/aposta';
import { Usuario } from './../../models/usuario';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class CampeonatoProvider {

  //private total: number = 0;

  constructor(private db: AngularFirestore) { }

  public verificaStatus(): Observable<any> {
    return this.db
      .collection('status', ref => ref.where('update', '==', true))
      .doc('update')
      .valueChanges();
  }

  public atualizaStatus(update: boolean) {
    this.db.collection('status')
      .doc('update')
      .set({
        datetime: new Date().toString(),
        value: new Date().getTime(),
        update: update
      });
  }

  ranking() {
    this.db.collection('rounds', ref => ref.where('timestamp', '<=', Number(new Date().getTime())).orderBy('timestamp', 'desc'))
      .valueChanges()
      .subscribe((rounds: Rodada[]) => {
        rounds.forEach(round => {
          let hoje = Number(new Date().getTime());
          let fech = Number(round.closed);
          let next = Number(new Date(round.next).getTime());
          if (/* hoje >= fech &&  */hoje < next) {
            round.status = 'rodada';
          }
          console.log('Atualizar pontuações...' + round.status + ' - ' + round.round);
          this.pontuacoes(round);
        });
      });
  }

  private pontuacoes(rodada: Rodada) {
    this.db.collection('users', ref => ref.where('slug', '==', 'rockman-dx'))
      .valueChanges()
      .first()
      .subscribe(users => {
        users.map((user: Usuario) => {
          if (rodada.status == 'rodada') {
            this.db.collection('ranking').doc(user.uid).delete();
            this.db.collection('ranking').doc(user.uid).valueChanges()
              .subscribe((values: Usuario) => {
                if (!values) {
                  this.db.collection('ranking').doc(user.uid)
                    .set({
                      slug: user.slug,
                      nick: user.nickname,
                      uid: user.uid,
                      atual: 0,
                      total: 0
                    });
                }
              });
          }
          this.usuarios(user, rodada);
        });
      });
  }

  private usuarios(usuario: Usuario, rodada: Rodada) {
    this.db
      .collection('users', ref => ref.where('slug', '==', usuario.slug))
      .valueChanges()
      .subscribe(users => {
        users.map((user: User) => {
          //console.log('Usuário...' + user.slug);
          this.palpites(rodada, usuario);
        });
      });
  }

  private palpites(rodada: Rodada, usuario: Usuario) {
    let r = 1;

    this.db
      .collection('hunches')
      .doc(usuario.slug)
      .collection(String(rodada.round))
      .valueChanges()
      .subscribe(partidas => {
        partidas.map((partida: Partida) => {
          this.resultados(rodada, usuario, partida, r);
          r++;
        });
      });
  }

  private resultados(rodada: Rodada,
    usuario: Usuario,
    partida: Partida,
    part?: number) {
    //if (usuario.rodada == undefined) {
    usuario.rodada = 0;
    //}

    //if (usuario.total == undefined) {
    usuario.total = 0;
    //}

    this.db.collection('resultados')
      .doc(String(rodada.round))
      .collection(String(rodada.round), ref =>
        ref.where('id', '==', partida.id)
      )
      .valueChanges()
      .subscribe(resultados => {
        resultados.map((resultado: Aposta) => {
          if (
            partida.homeScore != null &&
            partida.awayScore != null &&
            resultado.homeScore != null &&
            resultado.awayScore != null
          ) {
            if (rodada.status == 'rodada') {
              usuario.rodada =
                usuario.rodada +
                this.somarPontos(rodada, usuario, partida, resultado);
            } else {
              usuario.total =
                usuario.total +
                this.somarPontos(rodada, usuario, partida, resultado);
            }
          }
          //console.log(usuario.slug + '-' + rodada.round + '-' + usuario.rodada + '-' + usuario.total);

          this.db.collection('ranking')
            .doc(usuario.uid)
            .valueChanges()
            .subscribe((values: Usuario) => {
              if (rodada.status == 'rodada') {
                this.db.collection('ranking')
                  .doc(usuario.uid)
                  .update({
                    atual: usuario.rodada,
                    datetime: new Date().getTime()
                  });
              } else {
                this.db.collection('ranking')
                  .doc(usuario.uid)
                  .update({
                    total: usuario.total,
                    datetime: new Date().getTime()
                  });
              }
            });
        });
      });
  }

  private somarPontos(
    rodada: Rodada,
    usuario: User,
    partida: Partida,
    resultado: Aposta
  ): number {
    if (
      partida.homeScore === null ||
      resultado.homeScore === null ||
      partida.awayScore === null ||
      resultado.awayScore === null
    ) {
      return 0;
    }

    let pontos: number = 0;
    // Placar
    if (
      partida.homeScore == resultado.homeScore &&
      partida.awayScore == resultado.awayScore
    ) {
      return 25;
    }

    // Score Vencedor
    else if (
      partida.homeScore > partida.awayScore &&
      resultado.homeScore > resultado.awayScore &&
      partida.homeScore == resultado.homeScore &&
      partida.awayScore != resultado.awayScore
    ) {
      return 18;
    } else if (
      partida.awayScore > partida.homeScore &&
      resultado.awayScore > resultado.homeScore &&
      partida.awayScore == resultado.awayScore &&
      partida.homeScore != resultado.homeScore
    ) {
      return 18;
    }

    // Diferença
    else if (
      partida.homeScore > partida.awayScore &&
      resultado.homeScore > resultado.awayScore &&
      partida.homeScore - partida.awayScore ==
      resultado.homeScore - resultado.awayScore
    ) {
      return 15;
    } else if (
      partida.awayScore > partida.homeScore &&
      resultado.awayScore > resultado.homeScore &&
      partida.awayScore - partida.homeScore ==
      resultado.awayScore - resultado.homeScore
    ) {
      return 15;
    }

    // Score Perdedor
    else if (
      partida.homeScore < partida.awayScore &&
      resultado.homeScore < resultado.awayScore &&
      partida.homeScore == resultado.homeScore &&
      partida.awayScore != resultado.awayScore
    ) {
      return 12;
    } else if (
      partida.awayScore < partida.homeScore &&
      resultado.awayScore < resultado.homeScore &&
      partida.awayScore == resultado.awayScore &&
      partida.homeScore != resultado.homeScore
    ) {
      return 12;
    }

    // Time Vencedor
    else if (
      partida.homeScore > partida.awayScore &&
      resultado.homeScore > resultado.awayScore &&
      partida.homeScore - partida.awayScore !=
      resultado.homeScore - resultado.awayScore
    ) {
      return 10;
    } else if (
      partida.awayScore > partida.homeScore &&
      resultado.awayScore > resultado.homeScore &&
      partida.awayScore - partida.homeScore !=
      resultado.awayScore - resultado.homeScore
    ) {
      return 10;
    }

    // Empate não exato
    else if (
      partida.homeScore == partida.awayScore &&
      resultado.homeScore == resultado.awayScore &&
      partida.homeScore - resultado.homeScore != 0
    ) {
      return 15;
    }

    // Aposta empate e houver time vencedor
    else if (
      partida.homeScore == partida.awayScore &&
      resultado.homeScore != resultado.awayScore
    ) {
      return 2;
    }

    return pontos;
  }
}
