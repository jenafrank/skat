import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-root',
  providers: [ ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit{
 
  currentSeason:number;
  selectedSeason:number;  
  seasons: number[];
   
  ngOnInit(): void {
    this.selectedSeason = 26;
    this.currentSeason = 26;    
    this.generateSeasonArray();
  }  
  
  title = 'www.gutblatt.de';    
  
  constructor() {}

  generateSeasonArray():void {
    this.seasons = [];

    let i:number;
    for(i=this.currentSeason;i>=1;i--) {
      this.seasons.push(i);
    }
  }

  generateItemString(i:number):string {
    return "Saison " + i; 
  }

}
