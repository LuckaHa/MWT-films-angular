import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Film } from 'src/entities/film';
import { Observable } from 'rxjs';
import { UsersServerService } from './users-services.service';
import { tap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilmsServerService {

  url: string = "http://localhost:8080/films";

  constructor(private http: HttpClient, private userServerService: UsersServerService) { }

  get token() {
    return this.userServerService.token;
  }

  private getHeader(): {
    // urcenie vlastneho datoveho typu
    headers?: { "X-Auth-Token": string };
    params?: HttpParams;
  } {
    // ak je nejaka hlavicka, pridam ju, inak undefined - pouzije sa v get<FilmsResponse>
    return this.token ? { headers: { "X-Auth-Token": this.token } } : undefined;
  }

  getFilms(indexFrom?: number, indexTo?: number, search?: string, orderBy?: string, descending?: boolean): Observable<FilmsResponse> {
    let httpOptions = this.getHeader();
    if (indexFrom || indexTo || search || orderBy || descending) {
      httpOptions = {...(httpOptions || {}), params: new HttpParams}; // do options pridame parametre
    }
    if (indexFrom) {
      // set nemeni povodny objekt params, ale vracia novy s pridanim novej dvojice --> vysledok priradime do httpOptions.params
      httpOptions.params = httpOptions.params.set("indexFrom", "" + indexFrom); 
    }
    if (indexTo) {
      httpOptions.params = httpOptions.params.set("indexTo", "" + indexTo); 
    }
    if (search) {
      httpOptions.params = httpOptions.params.set("search", search); 
    }
    if (orderBy) {
      httpOptions.params = httpOptions.params.set("orderBy", orderBy); 
    }
    if (descending) {
      httpOptions.params = httpOptions.params.set("descending", "" + descending); 
    }

    return this.http
    .get<FilmsResponse>(this.url, httpOptions)
    .pipe(tap(resp => console.log(resp))); // tap len na vypis
  }

  saveFilm(film: Film): Observable<Film> {
    return this.http.post<Film>(this.url + "films/" + this.token, film);
  }
}

export interface FilmsResponse {
  items: Film[];
  totalCount: number;    
}
