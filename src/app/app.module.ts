import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { environment } from "../environments/environment";
import { AngularFireModule } from "angularfire2";
import { AngularFireDatabaseModule } from "angularfire2/database";

import { MatToolbarModule, MatSelectModule, MatMenuModule,
MatIconModule, MatButtonModule } from "@angular/material";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import {MatCardModule} from '@angular/material/card';
import { AngularFireAuth } from 'angularfire2/auth';


@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    MatToolbarModule,
    MatSelectModule,
    MatMenuModule,
    MatIconModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatSidenavModule,
    MatGridListModule,
    MatCardModule ],
  providers: [AngularFireAuth],
  bootstrap: [AppComponent]
})
export class AppModule { }
