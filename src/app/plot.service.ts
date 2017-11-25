import { Injectable } from '@angular/core';
import { LogicService } from "./logic.service";
import { isUndefined } from 'util';
import Chart from "chart.js";

@Injectable()
export class PlotService {
  
  myChart: Chart;

  constructor(private logic:LogicService) {}

  // specific fill colors for each player
  colorsFromNames(names:string[]):string[] {
    let ret:string[] = [];
    for(let name of names) {
      ret.push(this.logic.colors.get(name));
    }
    return ret;
  }

  // specific border colors for each player
  bordersFromNames(names:string[]):string[] {
    let ret:string[] = [];
    for(let name of names) {
      ret.push(this.logic.borders.get(name));
    }
    return ret;
  }

  // round the floats accordingly, no 100 digits or so!
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

  // sort the logic data to show the best leftmost, the worst righmost (bar plot)
  getSortedMapForBarPlot(mapkey:string):Map<string, number> {
    
    // invert map
    let map: Map<string,number>;
    map = this.logic[this.logic.labels.get(mapkey)];
    
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

  // bar plot
  barplot(key:string):void {

    let smap: Map<string,number>;
    smap = this.getSortedMapForBarPlot(key);

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
