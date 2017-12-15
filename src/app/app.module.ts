import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent, AppSeasonAdd, AppSeasonRemove } from './app.component';
import { environment } from "../environments/environment";
import { AngularFireModule } from "angularfire2";
import { AngularFireDatabaseModule } from "angularfire2/database";

import { MatToolbarModule, MatSelectModule, MatMenuModule,
MatIconModule, MatButtonModule } from "@angular/material";
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { AngularFireAuth } from 'angularfire2/auth';
import { FlexLayoutModule } from '@angular/flex-layout';

import { RouterModule, Routes } from '@angular/router';
import { EditComponent } from './edit/edit.component';
import { PagenotfoundComponent } from './pagenotfound/pagenotfound.component';
import { ReadComponent } from './read/read.component';
import { MatTableModule } from '@angular/material/table';
import { EditSpieltagComponent, AppGameRemove } from './edit-spieltag/edit-spieltag.component';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SpieltagTableComponent } from './spieltag-table/spieltag-table.component';
import { MatTabsModule } from '@angular/material/tabs';
import { AddGameComponent } from './add-game/add-game.component';
import { EditGameComponent } from './edit-game/edit-game.component';
import { MatExpansionModule } from '@angular/material/expansion';
import { GalerieComponent } from './galerie/galerie.component';

const appRoutes: Routes = [
  {
    path: 'galerie',
    component: GalerieComponent
  },
  {
    path: 'read',
    component: ReadComponent
  },
  {
    path: 'edit',
    component: EditComponent
  },
  {
    path: 'edit/spieltag/:id',
    component: EditSpieltagComponent
  },
  {
    path: 'add_game',
    component: AddGameComponent
  },
  {
    path: 'edit_game',
    component: EditGameComponent
  },
  {
    path: '',
    redirectTo: '/read',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: PagenotfoundComponent
  }
];

@NgModule({
  declarations: [
    AppComponent,
    EditComponent,
    PagenotfoundComponent,
    ReadComponent,
    EditSpieltagComponent,
    AppSeasonAdd,
    AppSeasonRemove,
    SpieltagTableComponent,
    AddGameComponent,
    EditGameComponent,
    AppGameRemove,
    GalerieComponent
  ],
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: false } // debug: true
    ),
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
    MatCardModule,
    FlexLayoutModule,
    MatTableModule,
    MatButtonToggleModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    MatTooltipModule,
    MatTabsModule,
    MatExpansionModule],
  entryComponents: [
    AppSeasonAdd,
    AppSeasonRemove,
    AppGameRemove
  ],
  providers: [AngularFireAuth],
  bootstrap: [AppComponent]
})
export class AppModule { }
