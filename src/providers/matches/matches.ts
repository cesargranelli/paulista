import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { Observable } from 'rxjs/Observable';
import { Platform } from 'ionic-angular';

@Injectable()
export class MatchesProvider {

  private basepath = "/api";

  constructor(
    private http: HttpClient,
    private platform: Platform
  ) {
    if(this.platform.is("cordova")) {
      this.basepath = 'https://www.sofascore.com';
    }
  }

  roundMatches(rodada): Observable<any> {
    return this.http.get(`${this.basepath}/u-tournament/16/season/7528/matches/round/${rodada}`);
  }

}
