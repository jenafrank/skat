import { Component } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AngularFireDatabase } from "angularfire2/database";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  
  items: Observable<any[]>;
  itemobj: Observable<any>;
  
  title = 'www.gutblatt.de';    
  
  constructor(db: AngularFireDatabase) {
    this.items = db.list('data').valueChanges();
    this.itemobj = db.object("test").valueChanges();

    this.items.subscribe(val => console.log(val));
    this.itemobj.subscribe(val => console.log(val));
  }

}
