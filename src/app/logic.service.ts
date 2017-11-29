import { Injectable } from '@angular/core';
import { isUndefined } from 'util';
import { DataService } from "./data.service";

@Injectable()
export class LogicService {

  // Accumulation of all players that occur in the current data state
  registeredPlayers: string[];

  // acc
  punkte: Map<string, number>;
  teilgenommen: Map<string, number>;
  gewonnen: Map<string, number>;
  gespielt: Map<string, number>;
  gewonnenGegenspiel: Map<string, number>;
  gespieltGegenspiel: Map<string, number>;

  // derived acc
  ratioGegen: Map<string, number>;
  ratioAllein: Map<string, number>;
  ratioGespielt: Map<string, number>;
  ronaldFaktor: Map<string, number>;
  ronaldGedeckelt: Map<string, number>;
  ronaldPunkte: Map<string, number>;
  verGegen: Map<string, number>;
  ver: Map<string, number>;
  turnierPunkte: Map<string, number>;
  turnierRonaldPunkte: Map<string, number>;
  turnierPPT: Map<string, number>;
  ratioPPT: Map<string, number>;

  // Labels
  labels: Map<string, string>;

  // Colors
  colors: Map<string, string>;
  borders: Map<string, string>;

  // series
  spieltagSeries: Map<number,number>;
  punkteSeries: Map<string, Map<number, number>>;

  // counters
  currentDay:number;
  currentTotalGame:number;

  constructor(private ds: DataService) { 
    this.initLabels();
    this.initColors();
    this.initBorders();
    this.reset();    
  }

  initColors():void {
    this.colors = new Map([
      ["A", "rgba(255,0,0,0.5)"],
      ["F", "rgba(0,255,0,0.5)"],
      ["R", "rgba(0,0,255,0.5)"],
      ["Ro", "rgba(255,0,255,0.5)"],
      ["Od", "rgba(255,128,128,0.5)"],
      ["T", "rgba(0,255,255,0.5)"],
      ["S", "rgba(128,0,0,0.5)"],
      ["M", "rgba(0,128,0,0.5)"],
      ["C", "rgba(0,0,128,0.5)"],
      ["J", "rgba(128,128,0,0.5)"],
      ["Ra", "rgba(128,0,128,0.5)"],
      ["P", "rgba(0,128,128,0.5)"]      
    ]);
  }

  initBorders():void {
    this.borders = new Map([
      ["A", "rgba(255,0,0,1)"],
      ["F", "rgba(0,255,0,1)"],
      ["R", "rgba(0,0,255,1)"],
      ["Ro", "rgba(255,0,255,1)"],
      ["Od", "rgba(255,128,128,1)"],
      ["T", "rgba(0,255,255,1)"],
      ["S", "rgba(128,0,0,1)"],
      ["M", "rgba(0,128,0,1)"],
      ["C", "rgba(0,0,128,1)"],
      ["J", "rgba(128,128,0,1)"],
      ["Ra", "rgba(128,0,128,1)"],
      ["P", "rgba(0,128,128,1)"]
    ]);    
  }
  
  initLabels():void {
    this.labels = new Map(
      [
        ["Echte Punkte", "punkte"],
        ["Teilgenommene Spiele", "teilgenommen"],
        ["Gewonnene Spiele", "gewonnen"],
        ["Spiele als Alleinspieler", "gespielt"],
        ["Gewonnene Spiele als Gegenspieler", "gewonnenGegenspiel"],
        ["Spiele als Gegenspieler", "gespieltGegenspiel"],
        ["% Gewonnene Gegenspiele", "ratioGegen"],
        ["% Gewonnene Alleinspiele", "ratioAllein"],
        ["% Anteil Alleinspiele an Teilgenommenen", "ratioGespielt"],
        ["Ronald-Faktor", "ronaldFaktor"],
        ["Ronald-Faktor mit Deckelung", "ronaldGedeckelt"],
        ["Punkte", "ronaldPunkte"],
        ["Verlorene Spiele als Gegenspieler", "verGegen"],
        ["Verlorene Spiele als Alleinspieler", "ver"],
        ["Echte Turnier-Punkte", "turnierPunkte"],
        ["Turnier-Punkte", "turnierRonaldPunkte"],
        ["Punkte-Pro-Teilgenommen Turnier", "turnierPPT"],
        ["Punkte-Pro-Teilgenommen", "ratioPPT"]
      ]
    );
  }

  reset():void {
    this.registeredPlayers = ["E"];
    this.punkte = new Map();
    this.teilgenommen = new Map();
    this.gewonnen = new Map();
    this.gespielt = new Map([["E", 0]]);
    this.gewonnenGegenspiel = new Map();
    this.gespieltGegenspiel = new Map();

    this.punkteSeries = new Map();
    this.spieltagSeries = new Map();
    this.currentDay = 0;
    this.currentTotalGame = 0;

    this.ratioGegen = new Map();
    this.ratioAllein = new Map();
    this.ratioGespielt = new Map();
    this.ronaldFaktor = new Map();
    this.ronaldGedeckelt = new Map();
    this.ronaldPunkte = new Map();
    this.verGegen = new Map();
    this.ver = new Map();
    this.turnierPunkte = new Map();
    this.turnierRonaldPunkte = new Map();
    this.turnierPPT = new Map();
    this.ratioPPT = new Map();
  }

  accumulateSeason(data:any) {
    let i:number = 1;
    while ( ! isUndefined(data[this.ds.day(i)])) {
      this.currentDay = i;      
      this.accumulateDay(data[this.ds.day(i)]);      
      i++;
    }            
  }

  accumulateDay(data:any) {
    let i:number = 1;
    while ( ! isUndefined(data[this.ds.game(i)])) {
      let gamedata:GameData = this.transformResponseToGameData(data[this.ds.game(i)]);
      this.accumulate(gamedata);      
      i++;
    }    
  }

  accumulate(data:GameData):void {

    this.addNewPlayers(data.activeThree);
    this.currentTotalGame++;

    for (let ply of data.activeThree) {
      this.inc(this.teilgenommen,ply);
    }
    this.inc(this.gespielt,data.declarer);

    // Eingemischt-Barriere:
    if (data.declarer == 'E') return;

    // Reguläres Spiel:
    this.add(this.punkte,data.declarer,data.points);
    this.incWithCondition(this.gewonnen,data.declarer,data.points > 0);

    // Nur für Gegenspiel-Statistik:
    for (let ply of data.activeThree) {
      if ( ply != data.declarer ) {
        this.inc(this.gespieltGegenspiel,ply);
        this.incWithCondition(this.gewonnenGegenspiel,ply,data.points < 0);
      }      
    }

    // Add data to series quantities
    this.punkteSeries
      .get(data.declarer)
      .set(this.currentTotalGame, this.punkte.get(data.declarer));

    if (this.currentDay > 0) {
      this.spieltagSeries.set(this.currentDay, this.currentTotalGame);
    }

    // Fehlerüberprüfung aus "all Five", "mod" und "activeThree" möglich
    // ...
  }

  calculateDerivedQuantities() {

    // Calculate reference number of games for ronald faktor
    let maxgames = 0.;
    for( let i in this.registeredPlayers) {
      let ply:string = this.registeredPlayers[i];
      if (ply == 'E') continue;
   
      let Nply = this.teilgenommen.get(ply);
      if (Nply > maxgames) maxgames = Nply;
    }

    // define cap
    let deckel = 3.;

    // Derive quantities:
    for( let i in this.registeredPlayers ) {

      let ply:string = this.registeredPlayers[i];

      if (ply == 'E') continue;

      this.ratioGegen
      .set(ply, this.gewonnenGegenspiel.get(ply) / this.gespieltGegenspiel.get(ply) * 100.);
      
      this.ratioAllein
      .set(ply, this.gewonnen.get(ply) / this.gespielt.get(ply) * 100.);
      
      this.ratioGespielt
      .set(ply,  this.gespielt.get(ply) / this.teilgenommen.get(ply) * 100.);      
      
      this.ronaldFaktor
      .set(ply,  maxgames / this.teilgenommen.get(ply));      

      this.ronaldGedeckelt
      .set(ply,  this.ronaldFaktor.get(ply) > deckel ? deckel : this.ronaldFaktor.get(ply));      

      this.ronaldPunkte
      .set(ply,  this.ronaldGedeckelt.get(ply) * this.punkte.get(ply));      
      
      this.verGegen
      .set(ply,  this.gespieltGegenspiel.get(ply) - this.gewonnenGegenspiel.get(ply));      
      
      this.ver
      .set(ply,  this.gespielt.get(ply) - this.gewonnen.get(ply));      
      
      this.turnierPunkte
      .set(ply,  this.punkte.get(ply) + 50 * (this.gewonnen.get(ply) - this.ver.get(ply)) + 40 * this.gewonnenGegenspiel.get(ply));      
      
      this.turnierRonaldPunkte
      .set(ply,  this.turnierPunkte.get(ply) * this.ronaldGedeckelt.get(ply));      
      
      this.turnierPPT
      .set(ply,  this.turnierPunkte.get(ply) / this.teilgenommen.get(ply));      
      
      this.ratioPPT
      .set(ply,  this.punkte.get(ply) / this.teilgenommen.get(ply));

    }
  }

  maxRoundFromDayData(data: any):number {
    let N:number = this.ds.totalgame(data);
    let max:number = 0;
    for (let i=1;i<=N;i++) {      
      let cnt:number = data[this.ds.game(i)].allPlayers.split(" ").length;
      if (cnt > max) max = cnt;
    }
    return max;
  }

  private add(map: Map<string,number>, key: string, x: number) {
    map.set(key,map.get(key)+x);
  }

  private inc(map: Map<string,number>, key: string) {
    map.set(key,map.get(key)+1);
  }

  private incWithCondition(map: Map<string,number>, key: string, condition: boolean) {
    if (condition) {
      this.inc(map,key);
    }
  }

  private addNewPlayers(players: string[]) {

    for (let ply of players) {
      if ( ! this.registeredPlayers.includes(ply)) {
        this.registeredPlayers.push(ply);

        this.punkte.set(ply,0);
        this.teilgenommen.set(ply,0);
        this.gewonnen.set(ply,0);
        this.gespielt.set(ply,0);
        this.gewonnenGegenspiel.set(ply,0);
        this.gespieltGegenspiel.set(ply,0);
        this.punkteSeries.set(ply, new Map());
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

export interface GameDataRaw {
  activeThree: string;
  allPlayers: string;
  declarer: string;
  kontra: string;
  mod: string;
  nrPlayers: string;
  points: number;
  time: string;
}