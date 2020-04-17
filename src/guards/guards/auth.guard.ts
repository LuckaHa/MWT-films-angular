import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanLoad, UrlSegment, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersServerService } from 'src/services/users-services.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(private usersService: UsersServerService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.canAnything(state.url);
  }
  
  canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> {
    return this.canAnything(route.path);
  }

  canAnything(url: string): boolean | Observable<boolean> {
    if (this.usersService.user) { //ak sa tam da presmerovat, ok
      return true;
    }
    this.usersService.redirectAfterLogin = url; //po login presmeruje na stranku, na kt. povodne chcel ist
    this.router.navigateByUrl('/login'); //presmeruje ho, aby sa najprv prihlasil
    return false;
  }
}
