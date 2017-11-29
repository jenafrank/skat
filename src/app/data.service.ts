import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from "angularfire2/database";
import { BehaviorSubject } from "rxjs/BehaviorSubject";
import { AngularFireList } from 'angularfire2/database/interfaces';
import { AuthenticationService } from "./authentication.service";
import { isUndefined } from 'util';

@Injectable()
export class DataService {

  // Which data set is currently loaded? What is the maximumum season?
  currentSeason:number;
  selectedSeason:number;
  alternativeTitle:string;

  // Fetched data object from Google Firebase
  dataObservable:Observable<any>;
  data:BehaviorSubject<any>;
  currentData:any;

  constructor(private db: AngularFireDatabase, private auth:AuthenticationService) {
    this.data = new BehaviorSubject(null);
    this.alternativeTitle = "";
    this.currentSeason = 27; 
    this.selectedSeason = 26;
    this.setSeason();
  }

  setSeason() {
    this.dataObservable = this.db.object(this.season(this.selectedSeason)).valueChanges(); 
    this.dataObservable.subscribe( (data) => { 
      if ( data == null ) {
        console.log("Season not available...");
        return;
      }
      // Propagate to subscribers:
      this.data.next(data);

      // Own service instance should hold a real value
      this.currentData = data;
    });    
  }

  season(i:number):string {
    return "season_"+i;
  }

  addSeason(i:number) {
    let seasonkey:string = this.season(i);
    let query:Observable<any> = this.db.object(seasonkey).valueChanges();
    query.subscribe( (res) => {
      if ( res == null) {
        console.log("Adding season...");
        const ref = this.db.object(seasonkey);
        ref.set(this.createdObject());
      } else {
        console.log("Not adding season... Exists already...");
      }
    });    
  }

  createdObject():Object {    
    let obj : Object = {
      created: {
        username: this.auth.username(), 
        time: (new Date()).toLocaleString()
      }
    };
    return obj;
  }

  removeSeason(i:number) {
    let seasonkey:string = this.season(i);
    let query:Observable<any> = this.db.object(seasonkey).valueChanges();
    query.subscribe( (res) => {
      if ( res == null) {
        console.log("Season not removed... Does not exist.");        
      } else if ( this.totalday(res) != 0 ) {
        console.log("Season not removed... Not empty...");
        console.log(res);
      } else {
        console.log("Would remove now...");
        const ref = this.db.object(seasonkey);
        ref.remove();
      }
    });
  }

  addSpieltag() {
    let i:number = this.totalday(this.currentData);
    i++;

    let seasonStr:string = this.season(this.selectedSeason);
    let spieltagStr:string = this.day(i);
    
    console.log("Adding Spieltag...");

    const ref = this.db.object(seasonStr+"/"+spieltagStr);
    ref.set(this.createdObject());

  }

  removeSpieltag() {
    let i:number = this.totalday(this.currentData);

    if (i == 0) {
      console.log("Spieltag can not be removed... No Spieltag exists...");
      return;
    }

    let seasonStr:string = this.season(this.selectedSeason);
    let spieltagStr:string = this.day(i);

    if ( this.totalgame(this.currentData[spieltagStr]) != 0) {
      console.log("Spieltag can not be removed... Not empty...");
      return;
    }

    console.log("Removing...");
    const ref = this.db.object(seasonStr+"/"+spieltagStr);
    ref.remove();
  }

  addGame() {

  }

  removeGame() {

  }

  day(i:number):string {
    return i > 10 ? "day_"+i : "day_0"+i;
  }

  game(i:number):string {
    return "game_"+i;
  }

  totalday(data: any):number {
    let i:number = 1;
    while ( ! isUndefined(data[this.day(i)]) ) i++;
    return i-1;
  }

  totalgame(data: any):number {
    let i:number = 1;
    while ( ! isUndefined(data[this.game(i)]) ) i++;
    return i-1;
  }
  
}
