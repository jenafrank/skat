import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { ActivatedRoute } from "@angular/router";
import { DataService } from "../data.service";
import { LogicService, GameData, GameDataRaw } from "../logic.service";
import { MatTableDataSource } from '@angular/material';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { isUndefined } from 'util';
import { Subscription } from 'rxjs/Subscription';
import { AuthenticationService } from "../authentication.service";
import { GameView } from "../spieltag-table/spieltag-table.component"

@Component({
  selector: 'app-edit-spieltag',
  templateUrl: './edit-spieltag.component.html',
  styleUrls: ['./edit-spieltag.component.css']
})
export class EditSpieltagComponent implements OnInit {

  spieltag: number;
  games: GameView[];
  
  dataSource: any;
  dataSource2: any;
  dataSource3: any;
  
  spieltagData: any;  
  displayedColumns: string[];
  players: string[];
  roundPlayers: string[];
  menuhelper: number;
  selected: string;
  ascendingSort: boolean;
  spieltagAcc: [string,number][];

  subscription: Subscription;

  constructor(private route:ActivatedRoute,
    private dataService: DataService,
    private logic: LogicService,
    public dialog: MatDialog,
    public auth: AuthenticationService) { }

  ngOnInit() {    
    this.ascendingSort = true;
    this.selected = "ADD";
    this.menuhelper = -1;
    this.roundPlayers=['😶','😶','😶','😶','😶'];
    this.players=['A','F','R','Ro','S','T','Od','P','😶'];
    this.spieltag = +this.route.snapshot.paramMap.get('id');    
    this.dataService.alternativeTitle = "Spieltag " + this.spieltag;
    this.subscription = this.dataService.data.subscribe( (seasonData) => {
      if (seasonData == null) return;
      this.spieltagData = seasonData[this.dataService.day(this.spieltag)];
      this.updateView();    
    })    
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
    this.dataService.alternativeTitle = null;
  }

  updateView() {
    this.buildHeader();
    this.buildGameArray();      
  }

  selectPlayer(el:string) {
    this.roundPlayers[this.menuhelper]=el;
  }

  buildHeader(): void {
    let maxround:number = this.logic.maxRoundFromDayData(this.spieltagData);
    this.displayedColumns = ["nr","ply1","ply2","ply3","ply4","ply5","points","declarer"];
    
    if (maxround < 5 ) {
      this.displayedColumns.splice(this.displayedColumns.indexOf("ply5"),1);
    }
    if (maxround < 4 ) {
      this.displayedColumns.splice(this.displayedColumns.indexOf("ply4"),1);
    }
  }

  buildGameArray():void {
    let total:number = this.dataService.totalgame(this.spieltagData);

    this.games = [];   

    let game: GameDataRaw;
    let view: GameView;
    let pnts: Map<string, number> = new Map();
    let currentPlayers: string = "";
    let i:number = 0;
    let splittedPlayers: string[];
    let noheaderCnt: number = 0;

    while (i < total) {
            
      game = this.spieltagData[this.dataService.game(i+1)];
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

        if (game.declarer != 'E') {
          pnts.set(game.declarer, pnts.get(game.declarer) + +game.points);
        }

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
    
    if (!this.ascendingSort) {
      this.games = this.games.reverse();
    }

    this.dataSource = new MatTableDataSource(this.games);        
    this.spieltagAcc = Array.from(this.logic.sortMap(pnts));
  }

  toggleSort():void {
    this.ascendingSort = !this.ascendingSort;
    this.updateView();
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

  openEdit(row:number): void {

  }

  filteredRoundPlayers(): string[] {
    let filteredRoundPlayers:string[] = [];
    for (let ply of this.roundPlayers) {
      if (ply != '😶') {
        filteredRoundPlayers.push(ply);
      }
    }
    return filteredRoundPlayers;
  }

  incmod():number {
    let filteredRoundPlayers: string[] = this.filteredRoundPlayers();
    let nrPly:number = filteredRoundPlayers.length;
    let maxGameNr:number = this.dataService.totalgame(this.spieltagData);
    let gamedata: GameDataRaw = this.spieltagData[this.dataService.game(maxGameNr)];

    if (gamedata == null) return 1;

    let mod:number = +gamedata.mod;

    if ( gamedata.allPlayers.split(" ").length != filteredRoundPlayers.length ) {
      return 1;
    }
    
    mod++;
    if (mod > nrPly) mod =1;

    return mod;    
  }

  calcActiveThree(): string[] {
    
    let filteredRoundPlayers: string[] = this.filteredRoundPlayers();

    let nrPly:number = filteredRoundPlayers.length;

    if (nrPly < 3) return null;

    if (nrPly == 3) {
      return filteredRoundPlayers;
    } 

    let maxGameNr:number = this.dataService.totalgame(this.spieltagData);
    let gamedata: GameDataRaw = this.spieltagData[this.dataService.game(maxGameNr)];

    if (gamedata == null) { 
      console.log("Something wrong with game data...");      
      console.log("First game of spieltag maybe...");      
    }

    let mod:number = this.incmod();

    if (nrPly == 4) {
      let p1:string = filteredRoundPlayers[0];
      let p2:string = filteredRoundPlayers[1];
      let p3:string = filteredRoundPlayers[2];
      let p4:string = filteredRoundPlayers[3];
      
      if (mod == 1) return [p2,p3,p4];
      if (mod == 2) return [p3,p4,p1];
      if (mod == 3) return [p4,p1,p2];
      if (mod == 4) return [p1,p2,p3];
    }

    if (nrPly == 5) {
      let p1:string = filteredRoundPlayers[0];
      let p2:string = filteredRoundPlayers[1];
      let p3:string = filteredRoundPlayers[2];
      let p4:string = filteredRoundPlayers[3];
      let p5:string = filteredRoundPlayers[4];
      
      if (mod == 1) return [p2,p3,p5];
      if (mod == 2) return [p3,p4,p1];
      if (mod == 3) return [p4,p5,p2];
      if (mod == 4) return [p5,p1,p3];
      if (mod == 5) return [p1,p2,p4];
    }

    console.log("Ups, that shouldn't happen");
    return null;
    
  }

  openAdd(): void {

    if (this.dataService.selectedSeason != this.dataService.currentSeason) {
      return;
    }

    let activeThree:string[] = this.calcActiveThree();
    let mod:number = this.incmod();

    if (activeThree ==  null) {
      console.log("ERR IN ACTIVE THREE");
      return;
    }
    
    let data:Object = {
      activeThree: activeThree,
      allPlayers: this.filteredRoundPlayers(),
      declarer: "E",
      points: 0,
      spieltag: this.spieltag,
      mod: mod
    }

    let dialogRef = this.dialog.open(EditSpieltagAdd, {
      width: '450px',
      data: data
    });

    dialogRef.afterClosed().subscribe((ok:boolean) => {
      
      if (!ok) return;
      
      console.log('The dialog was closed');  
      console.log(data);    
      
      this.dataService.addGame(data);
    });
  }

  removeLastGame():void {

    if (this.dataService.selectedSeason != this.dataService.currentSeason) {
      return;
    }

    this.dataService.removeGame(this.spieltag);
  }

}

@Component({
  selector: 'edit-spieltag-add',
  templateUrl: 'edit-spieltag-add.html',
  styleUrls: ['./edit-spieltag.component.css'] 
})
export class EditSpieltagAdd {

  points: number[];

  constructor(
    public dialogRef: MatDialogRef<EditSpieltagAdd>,
    @Inject(MAT_DIALOG_DATA) public data: any) { 
      this.points = [18,20,22,24,48,72,96,120];
    }

  onNoClick(): void {
    this.dialogRef.close(false);
  }

  toggle(ply): void {
    let isActive:boolean = this.data.activeThree.indexOf(ply) !== -1;
    if (isActive) {
      this.data.activeThree.splice(this.data.activeThree.indexOf(ply),1);
    } else {
      this.data.activeThree.push(ply);
    }
  }

  togglePly(ply): void {
    this.data.declarer = (this.data.declarer != ply) ? ply : "E";
    if (this.data.declarer == 'E') this.data.points = 0;
  }

  ok():boolean {

    if (this.data.activeThree.length != 3) return false;
    if (this.data.activeThree.indexOf(this.data.declarer) == -1 && this.data.declarer != 'E') return false;
    if (this.data.points == 0 && this.data.declarer != 'E') return false;

    return true;
  }

}



