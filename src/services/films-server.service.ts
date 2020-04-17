import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Film } from 'src/entities/film';
import { Observable } from 'rxjs';
import { UsersServerService } from './users-services.service';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class FilmsServerService {

  url: string = "http://localhost:8080/films";

  constructor(private http: HttpClient, private userServerService: UsersServerService) { }

  get token() {
    return this.userServerService.token;
  }

  // ak je nejaka hlavicka, pridam ju, inak undefined - pouzije sa v get<FilmsResponse>
  private getHeader() {
    return this.token ? { headers: { "X-Auth-Token": this.token } } : undefined;
  }

  getFilms(): Observable<FilmsResponse> {
    return this.http.get<FilmsResponse>(this.url, this.getHeader()).pipe(tap(resp => console.log(resp))); // tap len na vypis
  }
}

export interface FilmsResponse {
  items: Film[];
  totalCount: number;    
}
