import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FilmsRoutingModule } from './films-routing.module';
import { FilmsMenuComponent } from './films-menu/films-menu.component';
import { FilmEditComponent } from './film-edit/film-edit.component';
import { FilmsListComponent } from './films-list/films-list.component';
import { FilmDetailComponent } from './film-detail/film-detail.component';
import { MaterialModule } from 'src/app/material.module';


@NgModule({
  declarations: [FilmsMenuComponent, FilmEditComponent, FilmsListComponent, FilmDetailComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FilmsRoutingModule
  ]
})
export class FilmsModule { }
