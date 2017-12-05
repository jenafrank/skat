import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from "../authentication.service";
import { GameView } from "../interfaces.service";

@Component({
  selector: 'app-spieltag-table',
  templateUrl: './spieltag-table.component.html',
  styleUrls: ['./spieltag-table.component.css']
})
export class SpieltagTableComponent implements OnInit {

  @Input() dataSource: any;
  @Input() displayedColumns: string[];

  constructor(private auth: AuthenticationService) { }

  ngOnInit() {}

  rowMargin(row: GameView):boolean {    
    return row.mod == 1;
  }

  boldNames(element: GameView):boolean {
    return element.punkte == "";
  }

  selectRow(row) {
    if (this.auth.user() === null) return;
    console.log(row);
    // this.openEdit(row);        
  }

}

