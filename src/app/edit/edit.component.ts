import { Component, OnInit } from '@angular/core';
import { DataService } from "../data.service";
import { LogicService } from "../logic.service";
import { Router } from "@angular/router";

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.css']
})
export class EditComponent implements OnInit {

  totaldays: number;
  days: number[];
  
  constructor(private dataService: DataService,
   private logic: LogicService,
   private router: Router
  ) { }

  ngOnInit() {    
    this.dataService.data.subscribe( (seasonData:any) => {
      if (seasonData == null) return;            
      this.totaldays = this.dataService.totalday(seasonData);
      this.days = (new Array(this.totaldays)).fill(1).map( (val,idx) => {
        return idx+1;
      })
    });
  }  

  goSpieltag(i:number) {
    this.router.navigate(['/edit/spieltag', i]);   
  }

  addDay() {
    this.dataService.addSpieltag();
  }

  removeDay() {
    this.dataService.removeSpieltag();    
  }
}
