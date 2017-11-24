import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from "angularfire2/database";
import Chart from "chart.js";
import { LogicService, GameData } from "../logic.service";
import { isUndefined } from 'util';
import { AngularFireAuth } from 'angularfire2/auth';
import * as firebase from 'firebase/app';
import { Router } from "@angular/router";

@Component({
  selector: 'app-read',
  providers: [ LogicService ], 
  templateUrl: './read.component.html',
  styleUrls: ['./read.component.css']
})
export class ReadComponent implements OnInit {

  currentPlotKey:string;
  currentPlotValue:string;

  currentSeason:number;
  selectedSeason:number;  
  seasons: number[];
  labels:Map<string, string>;
  labelkeys:string[];

  data:Observable<any>;

  myChart: Chart;

  provider: any;

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

    this.provider = new firebase.auth.GoogleAuthProvider();
  }  
  
  title = 'www.gutblatt.de';    
  
  constructor(
    private db: AngularFireDatabase,
    private logic: LogicService,
    private afAuth: AngularFireAuth,
    private router: Router) {}

  login():void {
    this.afAuth.auth.signInWithPopup(this.provider);
  }
  logout():void {
    this.afAuth.auth.signOut();    
  }

  goEdit():void {
    this.router.navigate(['/edit']);
  }

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

  colorsFromNames(names:string[]):string[] {
    let ret:string[] = [];
    for(let name of names) {
      ret.push(this.logic.colors.get(name));
    }
    return ret;
  }

  bordersFromNames(names:string[]):string[] {
    let ret:string[] = [];
    for(let name of names) {
      ret.push(this.logic.borders.get(name));
    }
    return ret;
  }

  postProcessNumbers(key:string, values:number[]):number[] {
    let val: string = this.logic.labels.get(key);

    let newvalues: number[] = [];
    for (let el of values) {
      if (el < 100) {
        newvalues.push(+el.toFixed(2));
      } else if (el < 1000) {
        newvalues.push(+el.toFixed(1));
      } else {
        newvalues.push(+el.toFixed(0));
      }
    }
    return newvalues;    
  }
  
  plot(key:string):void {

    let smap: Map<string,number>;
    smap = this.getSortedMap(key);

    let labels:string[] = Array.from(smap.keys());
    let values:number[] = Array.from(smap.values());

    values = this.postProcessNumbers(key,values);

    var ctx = document.getElementById("myChart");
    
    if ( ! isUndefined(this.myChart)) this.myChart.destroy();
    this.myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{          
          data: values,
          backgroundColor: this.colorsFromNames(labels),
          borderColor: this.bordersFromNames(labels),
          borderWidth: 1
        }]
      },
      options: {

        title: {
          display: true,
          text: key,
          padding: 20,
          fontSize: 16
        },

        /*
        layout: {
          padding: {
            top: 40,
            left: 10
          }
        },
        */

        maintainAspectRatio: false,

        tooltips: {
          enabled: false
        },

        hover: {
          animationDuration: 0
        },

        animation: {
          onComplete: function () {

            var chartInstance = this.chart;            
            var ctx = chartInstance.ctx;
            ctx.font = Chart.helpers.fontString(Chart.defaults.global.defaultFontSize, Chart.defaults.global.defaultFontStyle, Chart.defaults.global.defaultFontFamily);
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";

            this.data.datasets.forEach(function (dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              meta.data.forEach(function (bar, index) {
                var data = dataset.data[index];                            
                ctx.fillText(data, bar._model.x, bar._model.y - 5);
              });
            });

          }
        },

        legend: {
          display: false
        },

        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: true,
              fontSize: 16
            }
          }],
          xAxes: [{
            ticks: {
              fontSize: 20
            }
          }]
        }

      }
    });
  }
}
