import { Component, OnInit, AfterViewInit } from '@angular/core';
import { FilmsServerService } from 'src/services/films-server.service';
import { Film } from 'src/entities/film';

@Component({
  selector: 'app-films-list',
  templateUrl: './films-list.component.html',
  styleUrls: ['./films-list.component.css']
})
export class FilmsListComponent implements OnInit, AfterViewInit {

  films: Film[] = [];
  columnsToDisplay = ["id", "nazov", "slovenskyNazov", "rok"];
  
  constructor(private filmsServerService: FilmsServerService) { }

  ngOnInit(): void {
    if (!this.filmsServerService.token) {
      this.columnsToDisplay = ["id", "nazov", "rok"];
    }
  }

  ngAfterViewInit(): void {
    this.filmsServerService.getFilms().subscribe(filmsResponse => this.films = filmsResponse.items);
  }
}
