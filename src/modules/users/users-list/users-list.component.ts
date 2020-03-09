import { Component, OnInit } from '@angular/core';
import { User } from 'src/entities/user';
import { UsersServerService } from 'src/services/users-services.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.css']
})
export class UsersListComponent implements OnInit {

  users:User[] = [new User("Peter", "peter@gmail.sk"), 
                  new User("Jožo", "jozo@gmail.sk", 2, new Date("2020-01-17"))];
  // ten posledny je "na kolene napisany user". metody by sa na nom nedali volat

  selectedUser:User;
  users$: Observable<User[]>; //je zvyk, ze premenna prudu dat sa konci $
  columnsToDisplay=["name","email","id"];

  constructor(private usersServerService: UsersServerService) { // natiahneme si server ako singlton a vdaka private aj ako instancnu premennu

  }

  ngOnInit(): void {
    // a) cez subscribe: ak pride pole userov, prirad ho do this.users, ak pride chyba, vypis ju
    this.usersServerService.getServerUsers().subscribe(
      users => this.users = users,
      error => {
        window.alert("Chyba: " + JSON.stringify(error));
      });

    // b) cez async v users-list.component.html... ocakava, ze vzdy data pridu
    this.users$ = this.usersServerService.getServerUsers();
  }

  selectUser(user: User) {
    this.selectedUser = user;
  }

}
