import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AuthenticationService } from "../authentication.service";
import { GlobalService } from '../global.service';
import { DataService } from '../data.service';
import { Subscription } from 'rxjs/Subscription';

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
  
  constructor(
    private route: ActivatedRoute, 
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

  onNoClick(): void {    
  }

  onOkClick(): void {
    /*
    let data:Object = {
      activeThree: activeThree,
      allPlayers: this.filteredRoundPlayers(),
      declarer: "E",
      points: 0,
      spieltag: this.spieltag,
      mod: mod
    }
  
      this.dataService.addGame(data);
    });
    */
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

}
