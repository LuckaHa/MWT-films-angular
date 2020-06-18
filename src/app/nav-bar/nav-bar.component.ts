import { Component, OnInit } from '@angular/core';
import { UsersServerService } from 'src/services/users-services.service';
import { Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { AuthState, AuthModel } from 'src/shared/auth.state';
import { Observable } from 'rxjs';
import { Logout } from 'src/shared/auth.actions';

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css']
})
export class NavBarComponent implements OnInit {

  username: string = "";
  @Select(AuthState) authState$: Observable<AuthModel>; // ziskame hodnotu stavu
  //@Select(state => state.auth.username) username$: Observable<string>; // b) sledovanie len casti stavu: username

  constructor(
    private userServerService: UsersServerService, 
    private router: Router,
    private store: Store
  ) { }

  ngOnInit(): void {
    this.authState$.subscribe(authModel => { // vypytam si authModel a podla neho nastavim username
      this.username = authModel.username;
    });
    /** b)
    this.username$.subscribe(username => { // vypytam si authModel a podla neho nastavim username
      this.username = username;
    });
    */
  }

  logout() {
    this.store.dispatch(new Logout()).subscribe(() => {
      this.router.navigateByUrl("/login");
    })
    this.userServerService.logout();
    this.router.navigateByUrl("/login")
  }
}
