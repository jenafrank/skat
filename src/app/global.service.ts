import { Injectable } from '@angular/core';

@Injectable()
export class GlobalService {

  toolbarMenufct: () => void;

  constructor() { 
    this.toolbarMenufct = () => { console.log("defaultToolbarFct") };    
  }

}
