import { RodadaProvider } from './../../providers/rodada/rodada';
import { HttpClient } from "@angular/common/http";
import { Component, Injectable } from "@angular/core";
import { FormBuilder, FormGroup } from '@angular/forms';

import { AlertController, Loading, LoadingController, IonicPage, NavParams, Platform } from "ionic-angular";

import { AngularFirestore } from '@angular/fire/firestore';

import { Observable } from "rxjs/Observable";

@Injectable()
@IonicPage()
@Component({
  selector: "page-palpite",
  templateUrl: "palpite.html"
})
export class PalpitePage {

  public rounds$: Observable<any>;
  public userid;
  public slug;

  public idRound: string = "1";

  public basepath = "/api"; // Para teste em desenvolvimento
  public selectDefault: string = "Rodada 1";
  public dates$: Observable<any>;
  public matches$: Observable<any>;
  public roundMatches$: Observable<any>;

  hunchForm: FormGroup;

  // Teste
  dateNow: string = new Date(new Date().setSeconds(-10800)).toISOString();
  dateHoje: number = new Date(new Date().setSeconds(-10800)).getTime();
  dateFech: number;

  constructor(
    private navParams: NavParams,
    private platform: Platform,
    private db: AngularFirestore,
    private http: HttpClient,
    public formBuilder: FormBuilder,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public roundService: RodadaProvider
  ) {

    this.userid = this.navParams.get('userid');
    this.slug   = this.navParams.get('slug');

    db.firestore.settings({ timestampsInSnapshots: true });

    if (this.platform.is("cordova")) {
      this.basepath = "https://www.sofascore.com";
    }

  }

  ionViewDidLoad() {

    this.rounds$ = this.roundService.rodadas;

    this.roundMatches(this.idRound);

  }

  setIdRound(idRound) {
    this.idRound = idRound;
  }

  roundMatches(id?: string) {

    this.db
      .collection("hunches")
      .doc(this.slug)
      .collection(this.idRound)
      .valueChanges()
      .subscribe(matches => {
        if (!matches.length) {
          this.addMatches(this.idRound);
        } else {
          this.matches$ = this.matches(this.idRound);
        }
      });

  }

  addMatches(id) {

    let idRound;

    (id == "1") ? idRound = "1" : null;
    (id == "2") ? idRound = "2" : null;
    (id == "3") ? idRound = "3" : null;
    (id == "4") ? idRound = "4/1/8" : null;
    (id == "5") ? idRound = "3/Quarterfinals" : null;
    (id == "6") ? idRound = "2/Semifinals" : null;
    (id == "7") ? idRound = "1/Final" : null;

    let loading: Loading = this.showLoading();

    this.roundMatches$ = this.http.get(`${this.basepath}/u-tournament/16/season/15586/matches/round/${idRound}`);
    //this.roundMatches$ = this.http.get(`api_round.php?id=${idRound}`);
    this.roundMatches$.subscribe(matches => {
      for (let tournament in matches.roundMatches.tournaments) {
        for (let event in matches.roundMatches.tournaments[tournament].events) {
          let match = matches.roundMatches.tournaments[tournament].events[event];
          this.db
            .collection("hunches")
            .doc(this.slug)
            .collection(id)
            .doc(String(match.id))
            .set({
              id: match.id,
              round: id,
              startTimestamp: match.startTimestamp,
              formatedStartDate: match.formatedStartDate,
              startTime: match.startTime,
              homeTeam: match.homeTeam.name,
              homeSlug: match.homeTeam.slug,
              homeLogo: `https://www.sofascore.com/images/team-logo/football_${match.homeTeam.id}.png`,
              homeScore: null,
              awayTeam: match.awayTeam.name,
              awaySlug: match.awayTeam.slug,
              awayLogo: `https://www.sofascore.com/images/team-logo/football_${match.awayTeam.id}.png`,
              awayScore: null
            })
            .then(function() {
              console.log("Document successfully written!");
            })
            .catch(function(error) {
              console.error("Error writing document: ", error);
            });
        }
      }
    });

    this.matches$ = this.matches(id);

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

  }

  matches(idRound): Observable<any> {

    this.db.collection("rounds", ref => ref.where("round", "==", Number(idRound)))
           .valueChanges()
           .subscribe(
             (date: any) => {
               this.dateFech = new Date(date[0].closed).getTime();
              }
            );

    return this.db
             .collection("hunches")
             .doc(this.slug)
             .collection(idRound, ref => ref.orderBy("startTimestamp"))
             .valueChanges();
  }

  onSubmit(): void {

    let loading: Loading = this.showLoading();

    for (let i = 0; i < event.srcElement.children.length -1; i++) {
      let docId     = event.srcElement.children.item(i).getElementsByTagName("ion-grid").item(0).id;
      let idRound   = event.srcElement.children.item(i).getElementsByTagName("ion-col").item(0).id;
      let homeScore = event.srcElement.children.item(i).getElementsByTagName("input").item(0).value;
      let awayScore = event.srcElement.children.item(i).getElementsByTagName("input").item(1).value;
      let update    = String(new Date().getTime());

      if (homeScore != "" && awayScore != "") {
        this.db
          .collection("hunches")
          .doc(this.slug)
          .collection(idRound)
          .doc(docId)
          .update({
            homeScore: homeScore,
            awayScore: awayScore,
            update: update,
            saved: true
          })
          .catch(error => {
            this.showAlert(error);
            setTimeout(() => {
              loading.dismiss();
            }, 2000);
          });
      }
    }

    setTimeout(() => {
      loading.dismiss();
    }, 2000);

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
