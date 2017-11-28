import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { LogicService } from "./logic.service";
import { PlotService } from './plot.service';
import { DataService } from "./data.service";
import { AuthenticationService } from './authentication.service';

@Component({
  selector: 'app-root',
  providers: [ LogicService, PlotService, DataService, AuthenticationService ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
    
  seasons: number[];
   
  ngOnInit(): void {      
    this.generateSeasonArray();
    this.subscribeForAccumulation();
  }  
  
  title = 'gutblatt.de';    
  
  constructor(
    private logic: LogicService,
    private dataService: DataService) {}

  subscribeForAccumulation():void {    
    this.dataService.data.subscribe(response => {       
      this.logic.accumulateSeason(response);      
      this.logic.calculateDerivedQuantities();
    });
  }

  computedTitle() {
    return this.dataService.alternativeTitle.length > 0 ?
      this.dataService.alternativeTitle: this.title;
  }

  generateSeasonArray():void {
    this.seasons = [];

    let i:number;
    for(i=this.dataService.currentSeason;i>=1;i--) {
      this.seasons.push(i);
    }
  }

  generateItemString(i:number):string {
    return "Saison " + i; 
  }
}
