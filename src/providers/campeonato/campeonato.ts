import { Injectable } from '@angular/core';

import { AngularFirestore } from '@angular/fire/firestore';

import { Partida } from '../../models/partida';
import { Aposta } from '../../models/aposta';
import { Usuario } from './../../models/usuario';

@Injectable()
export class CampeonatoProvider {

  constructor(private db: AngularFirestore) { }

  public atualizaDados() {
    this.db.collection('status').ref.where('nextDate', '<=', new Date()).get()
      .then(doc => doc.forEach(() => {
        this.atualizaStatus();
        this.usuarios();
      }));
  }

  private atualizaStatus() {
    this.db.collection('status').doc('update').set({
      nextDate: new Date(new Date().setHours(new Date().getHours() + 12))
    });
  }

  private usuarios() {
    this.db.collection('users'/* , ref => ref.where('slug', '==', 'rockman-dx') */).valueChanges()
      .subscribe(users => {
        users.forEach((user: Usuario) => this.ranking(user));
      });
  }

  private ranking(usuario: Usuario) {
    this.db.collection('ranking').doc(usuario.uid).set({
      slug: usuario.slug,
      nick: usuario.nickname,
      uid: usuario.uid,
      atual: 0,
      total: 0
    });
    this.rodadas(usuario);
  }

  private rodadas(user: Usuario) {
    this.db.collection('rounds').ref.where('timestamp', '<=', Number(new Date().getTime())).orderBy('timestamp', 'desc').get()
      .then(doc => doc.forEach(round => {
        let hoje = new Date();
        let fech = new Date(round.data().closed);
        let next = new Date(round.data().next);
        if (hoje >= fech && hoje < next) {
          this.palpites(round.data().round, user, 'rodada');
        } else {
          this.palpites(round.data().round, user, 'campeonato');
        }
      }));
  }

  private palpites(rodada: string, usuario: Usuario, status: string) {
    this.db.collection('hunches').doc(usuario.slug).collection(String(rodada)).valueChanges()
      .subscribe(partidas => {
        partidas.map((partida: Partida) => {
          if (status === 'rodada') {
            this.resultadosRodada(rodada, usuario, partida);
          } else {
            this.resultadosCampeonato(rodada, usuario, partida);
          }
        });
      });
  }

  private resultadosRodada(rodada: string, usuario: Usuario, partida: Partida) {
    this.db.collection('resultados').doc(String(rodada))
      .collection(String(rodada), ref => ref.where('id', '==', partida.id))
      .valueChanges()
      .subscribe(resultados => {
        resultados.map((resultado: Aposta) => {
          if (
            partida.homeScore != null &&
            partida.awayScore != null &&
            resultado.homeScore != null &&
            resultado.awayScore != null
          ) {
            usuario.rodada = usuario.rodada + this.somarPontos(partida, resultado);
            //console.log(usuario.slug + '-' + rodada + '-' + usuario.rodada);
            this.db.collection('ranking').doc(usuario.uid)
              .valueChanges()
              .subscribe(() => {
                this.db.collection('ranking').doc(usuario.uid).update({
                  atual: usuario.rodada,
                  datetime: new Date().getTime()
                });
              });
          }
        });
      });
  }

  private resultadosCampeonato(rodada: string, usuario: Usuario, partida: Partida) {
    this.db.collection('resultados').doc(String(rodada))
      .collection(String(rodada), ref => ref.where('id', '==', partida.id))
      .valueChanges()
      .subscribe(resultados => {
        resultados.map((resultado: Aposta) => {
          if (
            partida.homeScore != null &&
            partida.awayScore != null &&
            resultado.homeScore != null &&
            resultado.awayScore != null
          ) {
            usuario.total = usuario.total + this.somarPontos(partida, resultado);
            console.log(usuario.slug + '-' + rodada + '-' + usuario.total);
            this.db.collection('ranking').doc(usuario.uid)
              .valueChanges()
              .first()
              .subscribe((docs: Usuario) => {
                this.db.collection('ranking').doc(usuario.uid).update({
                  total: docs.total + usuario.total,
                  datetime: new Date().getTime()
                });
              });
          }
        });
      });
  }

  private somarPontos(partida: Partida, resultado: Aposta): number {
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
