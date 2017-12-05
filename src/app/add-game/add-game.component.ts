import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthenticationService } from "../authentication.service";
import { GlobalService } from '../global.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs/Subscription';
import { isUndefined } from 'util';
import { GameDataRaw, GameData } from "../interfaces.service";

@Component({
  selector: 'app-add-game',
  templateUrl: './add-game.component.html',
  styleUrls: ['./add-game.component.css']
})
export class AddGameComponent implements OnInit, OnDestroy {

  points: number[];
  selectedPoints: number;

  availablePlayers: string[];
  players: string[];
  menuhelper: number;

  season: number;
  spieltag: number;
  spieltagData: any;
  
  activeThree: string[];
  declarer: string;

  lockOpen: boolean;
  subscription: Subscription;
  kontra: string;
  
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private auth:AuthenticationService, 
    private glob:GlobalService,
    private dataService:DataService) {
    
  }

  ngOnInit() {
    this.lockOpen = false;
    this.points = [18, 20, 22, 24, 48, 72, 96, 120];   
    this.menuhelper = -1; 

    this.season = this.route.snapshot.queryParams['season'];
    this.spieltag = this.route.snapshot.queryParams['spieltag'];
    this.glob.spieltag = this.spieltag;
    this.dataService.alternativeTitle = "Spieltag " + this.spieltag;
    
    this.kontra = "";
    this.declarer = " ";
    this.players = this.glob.getFilteredRoundPlayers();
    this.availablePlayers = this.glob.availablePlayers;
    this.activeThree = [];
    this.selectedPoints = null;

    this.subscription = this.dataService.data.subscribe( (seasonData:any) => {
      if (seasonData == null) return;                 
      this.spieltagData = seasonData[this.dataService.day(this.spieltag)];
      this.activeThree = Array.from(this.glob.calcActiveThree(this.spieltagData));
    });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

  onOkClick(): void {

    let now = new Date();
    
    let gamedata:GameData = {
      activeThree: this.activeThree,
      allPlayers: this.players,
      declarer: this.declarer,
      points: this.selectedPoints,
      spieltag: this.spieltag,
      mod: this.glob.incmod(this.spieltagData),
      kontra: this.kontra,
      nrPlayers: this.players.length,
      time: now.toLocaleString()
    }
  
    this.dataService.addGame(gamedata);    
    this.router.navigate(['/edit/spieltag', this.glob.spieltag]);  
  }

  toggle(ply): void {    
    let isActive: boolean = this.activeThree.indexOf(ply) !== -1;
    if (isActive) {
      this.activeThree.splice(this.activeThree.indexOf(ply), 1);
    } else {
      this.activeThree.push(ply);
    }
  }

  togglePly(ply): void {    
    this.declarer = (this.declarer != ply) ? ply : "E";
    if (this.declarer == 'E') this.selectedPoints = 0;    
  }

  ok(): boolean {
    /*
    if (this.data.activeThree.length != 3) return false;
    if (this.data.activeThree.indexOf(this.data.declarer) == -1 && this.data.declarer != 'E') return false;
    if (this.data.points == 0 && this.data.declarer != 'E') return false;

    */
    return true;    
  }

  selectPlayer(el:string) {
    this.glob.roundPlayers[this.menuhelper]=el;
    this.players = this.glob.getFilteredRoundPlayers();
    this.activeThree = Array.from(this.glob.calcActiveThree(this.spieltagData));
  }

  meaningfulPlayers():string[] {
    let ret:string[] = [];

    for (let ply of this.availablePlayers) {
      if (this.players.indexOf(ply) == -1) {
        ret.push(ply);
      }
    }

    return ret;
  }

  validate() {
    return this.activeThree.length == 3 && 
    this.declarer != null && 
    this.declarer.length > 0 && 
    this.selectedPoints != null;
  }

  kontraPlys():string[] {
    let ret:string[]=[];

    // Barrier:
    if (isUndefined(this.activeThree) || this.activeThree==null ) return [];

    for(let ply of this.activeThree) {
      if (ply != this.declarer) {
        ret.push(ply);
      }
    }

    return ret;
  }

}
