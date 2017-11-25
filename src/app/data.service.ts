import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from "angularfire2/database";

@Injectable()
export class DataService {

  // Which data set is currently loaded? What is the maximumum season?
  currentSeason:number;
  selectedSeason:number; 

  // Fetched data object from Google Firebase
  data:Observable<any>;  

  constructor(private db: AngularFireDatabase) {
    this.currentSeason = 26; 
    this.selectedSeason = 26;
    this.data = this.db.object(this.season(this.selectedSeason)).valueChanges();    
  }

  season(i:number):string {
    return "season_"+i;
  }

}
