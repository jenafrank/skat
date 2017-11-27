import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { DataService } from "../data.service";
import { LogicService, GameData, GameDataRaw } from "../logic.service";
import { MatTableDataSource } from '@angular/material';
import { isUndefined } from 'util';

@Component({
  selector: 'app-edit-spieltag',
  templateUrl: './edit-spieltag.component.html',
  styleUrls: ['./edit-spieltag.component.css']
})
export class EditSpieltagComponent implements OnInit {

  spieltag: number;
  games: GameView[];
  dataSource: any;
  spieltagData: any;  
  displayedColumns: string[];

  constructor(private route:ActivatedRoute,
    private dataService: DataService,
    private logic: LogicService) { }

  ngOnInit() {
    this.spieltag = +this.route.snapshot.paramMap.get('id');
    this.displayedColumns = ["nr","ply1","ply2","ply3","ply4","ply5","points","declarer"];

    this.dataService.data.subscribe( (seasonData) => {
      this.spieltagData = seasonData[this.logic.day(this.spieltag)];
      this.buildHeader();
      this.buildGameArray();      
    })    
  }

  buildHeader(): void {
    let maxround:number = this.logic.maxRoundFromDayData(this.spieltagData);
    if (maxround < 5 ) {
      this.displayedColumns.splice(this.displayedColumns.indexOf("ply5"),1);
    }
    if (maxround < 4 ) {
      this.displayedColumns.splice(this.displayedColumns.indexOf("ply4"),1);
    }
  }

  buildGameArray():void {
    let total:number = this.logic.totalgame(this.spieltagData);

    this.games = [];   

    let game: GameDataRaw;
    let view: GameView;
    let pnts: Map<string, number> = new Map();
    let currentPlayers: string = "";
    let i:number = 0;
    let splittedPlayers: string[];
    let noheaderCnt: number = 0;

    while (i < total) {
            
      game = this.spieltagData[this.logic.game(i+1)];
      view = this.getEmptyView();      

      let allPlayersSignature:string = game.allPlayers;
      
      if (currentPlayers != allPlayersSignature || (noheaderCnt > 7 && +game.mod==1)) {
        
        // Header mode
        
        noheaderCnt = 0;
        currentPlayers = allPlayersSignature;

        splittedPlayers = game.allPlayers.split(" ");
        view.ply1 = splittedPlayers[0];
        view.ply2 = splittedPlayers[1];
        view.ply3 = splittedPlayers[2];
        view.ply4 = splittedPlayers.length > 3 ? splittedPlayers[3] : " ";
        view.ply5 = splittedPlayers.length > 4 ? splittedPlayers[4] : " ";

        for (let ply of splittedPlayers) {
          if (isUndefined(pnts.get(ply))) {
            pnts.set(ply,0);
          }
        }

      } else {

        noheaderCnt++;

        // normal mode
        view.punkte = game.points.toString();
        view.nr = (i + 1).toString();
        view.spieler = game.declarer;
        view.mod = +game.mod;

        pnts.set(game.declarer, pnts.get(game.declarer) + +game.points);

        let splittedActive = game.activeThree.split(" ");
        
        for (let ply of splittedActive) {          
          if (splittedPlayers[0] == ply) view.ply1 = "⏤";
          if (splittedPlayers[1] == ply) view.ply2 = "⏤";
          if (splittedPlayers[2] == ply) view.ply3 = "⏤";
          if (splittedPlayers[3] == ply) view.ply4 = "⏤";
          if (splittedPlayers[4] == ply) view.ply5 = "⏤";
        }

        if (splittedPlayers[0] == game.declarer) view.ply1 = pnts.get(game.declarer).toString();
        if (splittedPlayers[1] == game.declarer) view.ply2 = pnts.get(game.declarer).toString();
        if (splittedPlayers[2] == game.declarer) view.ply3 = pnts.get(game.declarer).toString();
        if (splittedPlayers[3] == game.declarer) view.ply4 = pnts.get(game.declarer).toString();
        if (splittedPlayers[4] == game.declarer) view.ply5 = pnts.get(game.declarer).toString();

        if (splittedPlayers.length < 5) view.ply5 = " ";
        if (splittedPlayers.length < 4) view.ply4 = " ";

        i++;
      }

      this.games.push(view);
    }
    console.log(this.games);
    this.dataSource = new MatTableDataSource(this.games);
  }

  getEmptyView():GameView {
    let ret: GameView = {} as GameView;

    ret.nr="";
    ret.spieler="";
    ret.punkte="";
    ret.ply1="✶";
    ret.ply2="✶";
    ret.ply3="✶";
    ret.ply4="✶";
    ret.ply5="✶";
    ret.mod=0;

    return ret;
  }

  selectRow(row) {
    console.log(row);    
  }

  rowMargin(row: GameView):boolean {    
    return row.mod == 1;
  }

  boldNames(element: GameView):boolean {
    return element.punkte == "";
  }

}

interface GameView {
  nr:string,
  spieler:string,
  punkte:string,
  ply1:string,
  ply2:string,
  ply3:string,
  ply4:string,
  ply5:string,
  mod:number
}