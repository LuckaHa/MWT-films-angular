import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router, CanLoad, UrlSegment, Route } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersServerService } from 'src/services/users-services.service';
import { Store } from '@ngxs/store';
import { UrlAfterLogin } from 'src/shared/auth.actions';
import { tap, mapTo } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {
  constructor(
    private usersService: UsersServerService, 
    private router: Router,
    private store: Store 
  ) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      return this.canAnything(state.url);
  }
  
  canLoad(route: Route, segments: UrlSegment[]): boolean | Observable<boolean> {
    return this.canAnything(route.path);
  }

  canAnything(url: string): boolean | Observable<boolean> {
    if (this.store.selectSnapshot(state => state.auth.token)) { //ak sa tam da presmerovat, ok
      return true;
    }
    return this.store.dispatch(new UrlAfterLogin(url)) //po login presmeruje na stranku, na kt. povodne chcel ist
      .pipe(tap  (() => 
        this.router.navigateByUrl('/login')), //presmeruje ho, aby sa najprv prihlasil
        mapTo(false)
      );
  }
}
