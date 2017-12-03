import { Component, OnInit, Input } from '@angular/core';
import { AuthenticationService } from "../authentication.service";

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

export interface GameView {
  nr:string,
  spieler:string,
  punkte:string,
  ply1:string,
  ply2:string,
  ply3:string,
  ply4:string,
  ply5:string,
  mod:number
}
