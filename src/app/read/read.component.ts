import { Component, OnInit } from '@angular/core';
import { LogicService, GameData } from "../logic.service";
import { Router } from "@angular/router";
import { PlotService } from "../plot.service";
import { DataService } from "../data.service";
import { AuthenticationService } from "../authentication.service";

@Component({
  selector: 'app-read',
  providers: [ ], 
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.css']
})
export class ReadComponent implements OnInit {

  currentPlotKey:string;
  currentPlotValue:string;
  labels:Map<string, string>;
  labelkeys:string[];
  
  ngOnInit(): void {
    this.labels = this.logic.labels;
    this.labelkeys = Array.from(this.labels.keys());
    this.currentPlotKey = "Echte Punkte";
    this.currentPlotValue = this.labels.get(this.currentPlotKey);

    this.dataService.data.subscribe( response => {
      if (response == null) return;
      this.logic.accumulateSeason(response);      
      this.logic.calculateDerivedQuantities();
      this.plot.barplot(this.currentPlotKey);
    });    
  }  
  
  title = 'www.gutblatt.de';    
  
  constructor(
    private logic: LogicService,    
    private router: Router,
    private plot: PlotService,
    private dataService: DataService,
    private auth: AuthenticationService) {}

  goEdit():void {
    this.router.navigate(['/edit']);
  }
  
}
