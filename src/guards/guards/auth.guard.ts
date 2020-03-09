import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { UsersServerService } from 'src/services/users-services.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private usersService: UsersServerService, private router: Router) {}

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
      if (this.usersService.user) { //ak sa tam da presmerovat, ok
        return true;
      }
      this.usersService.redirectAfterLogin = state.url; //po login presmeruje na stranku, na kt. povodne chcel ist
      this.router.navigateByUrl('/login'); //presmeruje ho, aby sa najprv prihlasil
      return false;
  }
  
}
