import { Injectable } from '@angular/core';
import { DataService } from "./data.service";
import { GameData, GameDataRaw } from "./interfaces.service";

@Injectable()
export class GlobalService {

  roundPlayers: string[]; // persist

  filteredRoundPlayers:string[];
  availablePlayers:string[]=['A','F','R','Ro','S','T','Od','P','😶'];

  spieltag: number;

  toolbarMenufct: () => void;

  constructor(private dataService:DataService) { 
    this.spieltag = 1;
    this.toolbarMenufct = () => { console.log("defaultToolbarFct") };    
    this.filteredRoundPlayers = [];
    this.availablePlayers = ['A','F','R','Ro','S','T','Od','P','😶'];
    this.roundPlayers = ['😶','😶','😶','😶','😶'];
  }

  getFilteredRoundPlayers(): string[] {
    let filteredRoundPlayers:string[] = [];
    for (let ply of this.roundPlayers) {
      if (ply != '😶') {
        filteredRoundPlayers.push(ply);
      }
    }
    this.filteredRoundPlayers = filteredRoundPlayers;
    return filteredRoundPlayers;
  } 

  incmod(spieltagData: any):number {    
    let nrPly:number = this.filteredRoundPlayers.length;
    let maxGameNr:number = this.dataService.totalgame(spieltagData);
    let gamedata: GameDataRaw = spieltagData[this.dataService.game(maxGameNr)];

    if (gamedata == null) return 1;

    let mod:number = +gamedata.mod;

    if ( gamedata.allPlayers.split(" ").length != this.filteredRoundPlayers.length ) {
      return 1;
    }
    
    mod++;
    if (mod > nrPly) mod =1;

    return mod;    
  }

  calcActiveThree(spieltagData: any): string[] {
    
    let nrPly:number = this.filteredRoundPlayers.length;

    if (nrPly < 3) return [];

    if (nrPly == 3) {
      return this.filteredRoundPlayers;
    } 

    let maxGameNr:number = this.dataService.totalgame(spieltagData);
    let gamedata: GameDataRaw = spieltagData[this.dataService.game(maxGameNr)];

    if (gamedata == null) { 
      console.log("Something wrong with game data...");      
      console.log("First game of spieltag maybe...");      
    }

    let mod:number = this.incmod(spieltagData);

    if (nrPly == 4) {
      let p1:string = this.filteredRoundPlayers[0];
      let p2:string = this.filteredRoundPlayers[1];
      let p3:string = this.filteredRoundPlayers[2];
      let p4:string = this.filteredRoundPlayers[3];
      
      if (mod == 1) return [p2,p3,p4];
      if (mod == 2) return [p3,p4,p1];
      if (mod == 3) return [p4,p1,p2];
      if (mod == 4) return [p1,p2,p3];
    }

    if (nrPly == 5) {
      let p1:string = this.filteredRoundPlayers[0];
      let p2:string = this.filteredRoundPlayers[1];
      let p3:string = this.filteredRoundPlayers[2];
      let p4:string = this.filteredRoundPlayers[3];
      let p5:string = this.filteredRoundPlayers[4];
      
      if (mod == 1) return [p2,p3,p5];
      if (mod == 2) return [p3,p4,p1];
      if (mod == 3) return [p4,p5,p2];
      if (mod == 4) return [p5,p1,p3];
      if (mod == 5) return [p1,p2,p4];
    }

    console.log("Ups, that shouldn't happen");
    return [];
    
  }

}

