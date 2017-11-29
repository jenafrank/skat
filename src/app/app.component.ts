import { Component, OnInit, Inject } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { LogicService } from "./logic.service";
import { PlotService } from './plot.service';
import { DataService } from "./data.service";
import { AuthenticationService } from './authentication.service';

import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material";
import { isUndefined } from 'util';

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
  }  
  
  title = 'gutblatt.de';    
  
  constructor(
    private logic: LogicService,
    private dataService: DataService,
    public dialog: MatDialog) {}

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

  loadSeason(i: number) {
    this.dataService.selectedSeason = i;
    this.logic.reset();
    this.dataService.setSeason();
  }

  addSeason() {
    let dialogRef = this.dialog.open(AppSeasonAdd, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( ! isUndefined(result) ) {
        this.dataService.addSeason(result);
      }
    });    
  }

  removeSeason() {
    let dialogRef = this.dialog.open(AppSeasonRemove, {
      width: '250px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if ( ! isUndefined(result) ) {
        this.dataService.removeSeason(result);
      }
    });    
  }
}

@Component({
  selector: 'app-season-add',
  templateUrl: 'app-add-season.html',
})
export class AppSeasonAdd {

  constructor(
    public dialogRef: MatDialogRef<AppSeasonAdd>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}

@Component({
  selector: 'app-season-remove',
  templateUrl: 'app-remove-season.html',
})
export class AppSeasonRemove {

  constructor(
    public dialogRef: MatDialogRef<AppSeasonRemove>) { }

  onNoClick(): void {
    this.dialogRef.close();
  }

}