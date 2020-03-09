import { Injectable } from '@angular/core';
import { User } from 'src/entities/user';
import { Resolve } from '@angular/router';
import { ActivatedRouteSnapshot } from "@angular/router";
import { UsersServerService } from 'src/services/users-services.service';
import { RouterStateSnapshot } from "@angular/router";
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserResolverService implements Resolve<User> {
  constructor(private usersService: UsersServerService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<User> {
    return this.usersService.getUser(+route.paramMap.get("id")); //zvysok sa urobi v getUser
  }
}
