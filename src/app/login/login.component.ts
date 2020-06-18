import { Component, OnInit } from '@angular/core';
import { Auth } from 'src/entities/auth';
import { UsersServerService } from 'src/services/users-services.service';
import { error } from 'protractor';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Login } from 'src/shared/auth.actions';
import { AuthState } from "src/shared/auth.state";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  auth: Auth = new Auth("Peter");
  hidePass: boolean = true;

  constructor(
    private usersServerService: UsersServerService, // pristup k servisu cez instruktor
    private router: Router,
    private store: Store
  ) {}

  ngOnInit(): void {}

  get getAuth(): string {
    return JSON.stringify(this.auth);
  }

  formSubmit() {
    this.store.dispatch(new Login(this.auth)) // vyrobenie udalosti a odoslanie do uloziska
      .subscribe(() => {
        console.log("Login spracovany.");
        this.router.navigateByUrl(this.store.selectSnapshot(AuthState.redirectUrl));
      }
    ); 

    /** 
    // v auth je presne to, co je aktualne vo formulari, lebo je synchronizovana
    this.usersServerService.login(this.auth).subscribe(
      ok => {
        this.router.navigateByUrl(this.usersServerService.redirectAfterLogin);
        this.usersServerService.redirectAfterLogin="/users/extended"
      },
      // ak pride EMPTY, subscribe sa nezavola a teda nenastane presmerovanie na /users
      // v users-services.service.ts sme zaezpecili, ze v pripade akejkolvek chyby pride EMPTY
      error => {
        console.log("Error: " + JSON.stringify(error));
      }
    );
    */
  }
}
