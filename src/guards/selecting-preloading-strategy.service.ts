import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})

// vlastna strategia na to, aka stranka sa ma pred-nacitat (skor ako o to pouzivatel poziada) 
export class SelectingPreloadingStrategyService implements PreloadingStrategy {

  constructor() { }

  preload(route: Route, load: () => Observable<any>): Observable<any> {
    if (route.data && route.data.preloading) {
      console.log('Preloaded: ' + route.path);
      return load();
    } else {
      return of(null); // inak sa nacita az na poziadanie
    }
  }
}
