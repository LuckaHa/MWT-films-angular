import { Component, OnInit, AfterViewInit, ViewChild, EventEmitter } from '@angular/core';
import { FilmsServerService } from 'src/services/films-server.service';
import { Film } from 'src/entities/film';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { DataSource } from '@angular/cdk/table';
import { Observable, of } from 'rxjs';
import { map, switchMap, mergeAll, tap } from 'rxjs/operators';
import { MatSort, Sort } from '@angular/material/sort';

@Component({
  selector: 'app-films-list',
  templateUrl: './films-list.component.html',
  styleUrls: ['./films-list.component.css']
})
export class FilmsListComponent implements OnInit, AfterViewInit {

  films: Film[] = [];
  columnsToDisplay = ["id", "nazov", "slovenskyNazov", "rok", "afi1998", "afi2007"];
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  dataSrc: filmsDataSource;
  filter$ = new EventEmitter<string>(); // premenna dryiaca Observable sa oynaci na konci $
  
  constructor(private filmsServerService: FilmsServerService) { }

  ngOnInit(): void {
    if (!this.filmsServerService.token) {
      this.columnsToDisplay = ["id", "nazov", "rok"];
    }
    // posledne miesto, kde sa da nastavit dataSrc, lebo uz bude chciet poslat tabulke, co ma vykreslit
    this.dataSrc = new filmsDataSource(this.filmsServerService);
  }

  ngAfterViewInit(): void {
    this.dataSrc.setObservables(this.paginator, this.filter$, this.sort); // az po nacitani sa do prazdnej rury paginator pridaju data
  }

  applyFilter(value: string) {
    this.filter$.next(value);
  }
}

// vlastna implementacia DataSource
class filmsDataSource implements DataSource<Film> {
  paginator: MatPaginator;
  futureObservables = new EventEmitter<Observable<any>>(); // cez tuto ruru pojdu observables - ich hodnoty sa stanu vstupom do switchMap
  pageSize: number;
  indexFrom: number;
  filter: string;
  orderBy: string;
  descending: boolean;

  constructor(private filmsServerService: FilmsServerService) { }

  setObservables(paginator: MatPaginator, filter$: Observable<string>, sort: MatSort) {
    this.paginator = paginator;
    this.pageSize = paginator.pageSize;
    this.indexFrom = paginator.pageIndex * paginator.pageSize;

    this.futureObservables.next(of(null)) // sposobi nacitanie filmov uz pri pocitaocnom nacitani stranky
    this.futureObservables.next(paginator.page.pipe( // nacitanie pri dalsom prekliku
      tap((event: PageEvent) => {
        this.pageSize = event.pageSize;
        this.indexFrom = event.pageIndex * event.pageSize;
      })
    ));
    this.futureObservables.next(
      filter$.pipe(tap(filterString => {
        this.paginator.firstPage(); // na zaciatku vyhladavania sa presun na 1. stranku, aby si hladal od zaciatku
        this.filter = filterString;
      }))
    );
    this.futureObservables.next(sort.sortChange.pipe(
      tap((sortEvent: Sort) => {
        this.paginator.firstPage();
        this.orderBy;
        if (sortEvent.direction === "") { // ziaden smer
          this.orderBy = undefined;
          this.descending = undefined;
          return;
        }

        this.descending = sortEvent.direction === "desc"; // ak je to desc, tak true
        switch(sortEvent.active) {
          case "afi1998": {
            this.orderBy = "poradieVRebricku.AFI 1998";
            break;
          }
          case "afi2007": {
            this.orderBy = "poradieVRebricku.AFI 2007";
            break;
          }
          default: {
            this.orderBy = sortEvent.active;
          }
        }
      }))
    ); // dalsi zdroj udalosti, z ktoreho zistime, akym smerom maju byt polozky usporiadane
  }

  // ciel: ziskat a vratit filmy zakazdym, ked sa zmeni paginator
  connect(): Observable<Film[]> {
    return this.futureObservables.pipe(
      mergeAll(),
      switchMap(event => 
        this.filmsServerService
        .getFilms(this.indexFrom, this.indexFrom + this.pageSize, this.filter, this.orderBy, this.descending)
        .pipe(map(response => {
          this.paginator.length = response.totalCount;
          return response.items;
        }))
      )
    )
  }
  disconnect(): void {  }
}