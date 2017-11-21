import { Injectable } from '@angular/core';
import { isUndefined } from 'util';

@Injectable()
export class LogicService {

  registeredPlayers: string[];
  punkte: Map<string, number>;
  teilgenommen: Map<string, number>;
  gewonnen: Map<string, number>;
  gespielt: Map<string, number>;
  gewonnenGegenspiel: Map<string, number>;
  gespieltGegenspiel: Map<string, number>;

  constructor() { 
    this.reset();
  }

  reset():void {
    this.registeredPlayers = ["E"];
    this.punkte = new Map();
    this.teilgenommen = new Map();
    this.gewonnen = new Map();
    this.gespielt = new Map([["E", 0]]);
    this.gewonnenGegenspiel = new Map();
    this.gespieltGegenspiel = new Map();
  }

  accumulateSeason(data:any) {
    let i:number = 1;
    while ( ! isUndefined(data[this.day(i)])) {      
      this.accumulateDay(data[this.day(i)]);      
      i++;
    }        
  }

  accumulateDay(data:any) {
    let i:number = 1;
    while ( ! isUndefined(data[this.game(i)])) {
      let gamedata:GameData = this.transformResponseToGameData(data[this.game(i)]);
      this.accumulate(gamedata);      
      i++;
    }    
  }

  accumulate(data:GameData):void {

    this.addNewPlayers(data.activeThree);

    for (let ply of data.activeThree) {
      this.teilgenommen[ply] += 1;
    }
    this.gespielt[data.declarer] += 1;

    // Eingemischt-Barriere:
    if (data.declarer == 'E') return;

    // Reguläres Spiel:
    this.punkte[data.declarer] += data.points;
    if (data.points > 0) this.gewonnen[data.declarer] += 1;

    // Nur für Gegenspiel-Statistik:
    for (let ply of data.activeThree) {
      if ( ply != data.declarer ) {
        this.gespieltGegenspiel[ply] += 1;
        if ( data.points < 0 ) this.gewonnenGegenspiel[ply] += 1;
      }      
    }

    // Fehlerüberprüfung aus "all Five", "mod" und "activeThree" möglich
    // ...
  }

  private day(i:number):string {
    return i > 10 ? "day_"+i : "day_0"+i;
  }

  private game(i:number):string {
    return "game_"+i;
  }

  private addNewPlayers(players: string[]) {
    for (let ply of players) {
      if ( ! this.registeredPlayers.includes(ply)) {
        this.registeredPlayers.push(ply);

        this.punkte[ply]=0;
        this.teilgenommen[ply]=0;
        this.gewonnen[ply]=0;
        this.gespielt[ply]=0;
        this.gewonnenGegenspiel[ply]=0;
        this.gespieltGegenspiel[ply]=0;
      }
    }
  }
  
  transformResponseToGameData(response: any):GameData {
    
    let data:GameData = {} as GameData;

    let activeThree:string = response.activeThree as string;
    let allPlayers:string = response.allPlayers as string;

    data.activeThree = activeThree.split(" ");
    data.allPlayers = allPlayers.split(" ");
    data.declarer = response.declarer as string;
    data.kontra = response.kontra as string;
    data.mod = Number(response.mod);
    data.nrPlayers = Number(response.nrPlayers);
    data.points = Number(response.points);

    return data;
  }

}

export interface GameData {
  activeThree: string[];
  allPlayers: string[];
  declarer: string;
  kontra: string;
  mod: number;
  nrPlayers: number;
  points: number;
  time: string;
}
