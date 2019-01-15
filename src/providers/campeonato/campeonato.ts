import { Injectable } from "@angular/core";

import { AngularFirestore } from '@angular/fire/firestore';

//import { Observable } from "rxjs/Observable";
import "rxjs/operator/first";

import { Partida } from "../../models/partida";
import { Rodada } from "../../models/rodada";
import { User } from "../../models/user";
import { Aposta } from "../../models/aposta";
import { Usuario } from "./../../models/usuario";
import { Observable } from "rxjs/Observable";

@Injectable()
export class CampeonatoProvider {
  total: number = 0;

  constructor(private db: AngularFirestore) {}

  verificaStatus(): Observable<any> {
    return this.db
      .collection("status")
      .doc("datetime")
      .valueChanges();
  }

  atualizaStatus() {
    this.db
      .collection("status")
      .doc("datetime")
      .set({
        value: new Date(new Date().setSeconds(-10800)).getTime()
      });
  }

  ranking() {
    //this.atualizaStatus();

    //let rodadas: Rodada[] = [];

    this.db
      .collection("rounds", ref => ref.orderBy("round", "desc"))
      .valueChanges()
      .first()
      .subscribe((rounds: Rodada[]) => {
        rounds.forEach(round => {
          let hoje = new Date(new Date().setSeconds(-10800)).toISOString().substr(0, 10).replace(/[- ]/g, "");
          let fech = round.closed.replace(/[- ]/g, "");
          let next = round.next.replace(/[- ]/g, "");
          if (hoje >= fech) {
            round.status = "campeonato";
            if (hoje >= fech && hoje < next) {
              round.status = "rodada";
            }
            console.log("Atualizar pontuações..." + round.status + " - " + round.round);
            this.pontuacoes(round);
          }
        });
      });
  }

  pontuacoes(rodada: Rodada) {
    this.db
      .collection("users"/*, ref => ref.where("slug", "==", "rockman-dx")*/)
      .valueChanges()
      .first()
      .subscribe(users => {
        users.map((user: Usuario) => {
          if (rodada.status == "rodada") {
            this.db.collection("ranking").doc(user.uid).delete();
            this.db.collection("ranking").doc(user.uid).valueChanges()
              .subscribe((values: Usuario) => {
                if (!values) {
                  this.db.collection("ranking").doc(user.uid)
                    .set({
                      slug: user.slug,
                      nick: user.nickname,
                      uid: user.uid,
                      atual: 0,
                      rodada1: 0,
                      rodada2: 0,
                      rodada3: 0,
                      oitavas: 0,
                      quartas: 0,
                      semifinal: 0,
                      final: 0,
                      total: 0
                    });
                }
              });
          }
          //this.usuarios(user, rodada);
        });
      });
  }

  usuarios(usuario: Usuario, rodada: Rodada) {
    this.db
      .collection("users"/*, ref => ref.where("slug", "==", usuario.slug)*/)
      .valueChanges()
      .first()
      .subscribe(users => {
        users.map((user: User) => {
          //console.log("Usuário..." + user.slug);
          this.palpites(rodada, usuario);
        });
      });
  }

  palpites(rodada: Rodada, usuario: Usuario) {
    let r = 1;

    this.db
      .collection("hunches")
      .doc(usuario.slug)
      .collection(String(rodada.round))
      .valueChanges()
      .first()
      .subscribe(partidas => {
        partidas.map((partida: Partida) => {
          this.resultados(rodada, usuario, partida, r);
          r++;
        });
      });
  }

  resultados(
    rodada: Rodada,
    usuario: Usuario,
    partida: Partida,
    part?: number
  ) {
    //if (usuario.rodada == undefined) {
    usuario.rodada = 0;
    //}

    //if (usuario.total == undefined) {
    usuario.total = 0;
    //}

    this.db
      .collection("resultados")
      .doc(String(rodada.round))
      .collection(String(rodada.round), ref =>
        ref.where("id", "==", partida.id)
      )
      .valueChanges()
      .first()
      .subscribe(resultados => {
        resultados.map((resultado: Aposta) => {
          if (
            partida.homeScore != null &&
            partida.awayScore != null &&
            resultado.homeScore != null &&
            resultado.awayScore != null
          ) {
            if (rodada.status == "rodada") {
              usuario.rodada =
                usuario.rodada +
                this.somarPontos(rodada, usuario, partida, resultado);
            } else {
              usuario.total =
                usuario.total +
                this.somarPontos(rodada, usuario, partida, resultado);
            }
          }

          if (
            part == 16 ||
            (part == 8 && rodada.round == 4) ||
            (part == 4 && rodada.round == 5) ||
            (part == 2 && rodada.round == 6) ||
            (part == 1 && rodada.round == 7)
          ) {
            //console.log(usuario.slug + "-" + rodada.round + "-" + usuario.rodada + "-" + usuario.total);

            this.db
              .collection("ranking")
              .doc(usuario.uid)
              .valueChanges()
              .first()
              .subscribe((values: Usuario) => {
                if (rodada.status == "rodada") {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      atual: usuario.rodada,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                }
                if (rodada.round == 1) {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      rodada1: usuario.total,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                } else if (rodada.round == 2) {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      rodada2: usuario.total,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                } else if (rodada.round == 3) {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      rodada3: usuario.total,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                } else if (rodada.round == 4) {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      oitavas: usuario.total,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                } else if (rodada.round == 5) {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      quartas: usuario.total,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                } else if (rodada.round == 6) {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      semifinal: usuario.total,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                } else if (rodada.round == 7) {
                  this.db
                    .collection("ranking")
                    .doc(usuario.uid)
                    .update({
                      final: usuario.total,
                      datetime: new Date(
                        new Date().setSeconds(-10800)
                      ).getTime()
                    });
                }
              });
          }
        });
      });
  }

  somarPontos(
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
