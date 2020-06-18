import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { RegisterComponent } from './register/register.component';
import { AuthGuard } from 'src/guards/guards/auth.guard';
import { SelectingPreloadingStrategyService } from 'src/guards/selecting-preloading-strategy.service';

const routes: Routes = [
  {
    path: "films", 
    loadChildren: () => import('../modules/films/films.module').then(mod => mod.FilmsModule), // nacita az ked bolo zavolane loadChildren
    canLoad: [AuthGuard], // nacita len ak na to ma navstevnik pravo
    data: { preloading: false }
  },
  {
    path: "users", 
    loadChildren: () => import("../modules/users/users.module").then(mod => mod.UsersModule),
    data: { preloading: true } // toto sa nacita hned po nacitani login
  }, 
  {path: "login", component: LoginComponent},
  {path: "register", component: RegisterComponent},
  {path: "", redirectTo: "/users", pathMatch: "full"},
  {path: "**", component: PageNotFoundComponent}
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: SelectingPreloadingStrategyService})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
