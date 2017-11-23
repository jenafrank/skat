import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from "angularfire2/database";
import Chart from "chart.js";
import { LogicService, GameData } from "./logic.service";
import { isUndefined } from 'util';


@Component({
  selector: 'app-root',
  providers: [ LogicService ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{

  currentPlotKey:string;
  currentPlotValue:string;

  currentSeason:number;
  selectedSeason:number;  
  seasons: number[];
  labels:Map<string, string>;
  labelkeys:string[];

  data:Observable<any>;

  myChart: Chart;

  // logic: LogicService;
  // db: AngularFireDatabase;
  
  ngOnInit(): void {

    this.selectedSeason = 26;
    this.currentSeason = 26;
    this.labels = this.logic.labels;
    this.labelkeys = Array.from(this.labels.keys());
    
    this.currentPlotKey = "Echte Punkte";
    this.currentPlotValue = this.labels.get(this.currentPlotKey);
        
    this.loadData();
    this.generateSeasonArray();

  }  
  
  title = 'www.gutblatt.de';    
  
  constructor(private db: AngularFireDatabase, private logic: LogicService) {}

  loadData():void {    
    this.data = this.db.object(this.logic.season(this.selectedSeason)).valueChanges();

    console.log(this.logic.season(this.selectedSeason))
    console.log(this.data);

    this.data.subscribe(response => { 
      console.log(response);     

      this.logic.accumulateSeason(response);

      console.log(this.logic.punkte);
      console.log(this.logic.gespielt);
      console.log(this.logic.punkteSeries);
      console.log(this.logic.spieltagSeries);
      console.log(this.logic.ronaldPunkte);
      console.log(this.logic.teilgenommen);
      
      this.logic.calculateDerivedQuantities();
      this.plot(this.currentPlotKey);      
    });
  }

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

  getSortedMap(mapkey:string):Map<string, number> {
    
    // invert map
    let map: Map<string,number>;
    map = this.logic[this.labels.get(mapkey)];
    
    let invMap: Map<number, string[]>;
    invMap = new Map();
    
    let pnts: number[];
    pnts = [];

    for (let ky of Array.from(map.keys())) {
      let arr:string[] = invMap.get(map.get(ky));
      if ( isUndefined(arr) ) {
        invMap.set(map.get(ky),[ky]);
      } else {        
        arr.push(ky);
      }
      pnts.push(map.get(ky));
    }

    // sort points
    pnts = pnts.sort((n1,n2) => n2 - n1);

    // return according names
    let newmap: Map<string,number>;
    newmap = new Map();

    for (let x of pnts) {
      let arr:string[] = invMap.get(x);
      for (let str of arr) {        
        newmap.set(str,x);
      }      
    }

    return newmap;
  }
  
  plot(key:string):void {

    let smap: Map<string,number>;
    smap = this.getSortedMap(key);

    let labels:string[] = Array.from(smap.keys());
    let values:number[] = Array.from(smap.values());

    var ctx = document.getElementById("myChart");
    
    if ( ! isUndefined(this.myChart)) this.myChart.destroy();
    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{          
          data: values,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)'
          ],
          borderColor: [
            'rgba(255,99,132,1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true
            }
          }]
        }
      }
    });
  }

}
