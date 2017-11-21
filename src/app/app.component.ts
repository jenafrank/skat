import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from "angularfire2/database";
import Chart from "chart.js";
import { LogicService, GameData } from "./logic.service";


@Component({
  selector: 'app-root',
  providers: [ LogicService ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit{
  
  ngOnInit(): void {
    var ctx = document.getElementById("myChart");
    var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: ["Red", "Blue", "Yellow", "Green", "Purple", "Orange"],
        datasets: [{
          label: '# of Votes',
          data: [12, 19, 3, 5, 2, 3],
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
  
  title = 'www.gutblatt.de';    
  
  constructor(db: AngularFireDatabase, logic: LogicService) {
    // this.items = db.list('data').valueChanges();
    // this.items.subscribe(val => console.log(val));
    
    let x:Observable<any> = db.object("season_19").valueChanges();    
    x.subscribe(response => { 
      console.log(response);     
      logic.accumulateSeason(response);
      console.log(logic.punkte);
      console.log(logic.gespielt);
    });
  }

}
