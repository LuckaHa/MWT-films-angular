import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UsersServerService } from 'src/services/users-services.service';
import { switchMap } from 'rxjs/operators';
import { User } from 'src/entities/user';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit {

  userToEdit: User; // nasetuje sa v ngOnInit

  constructor(
    private route: ActivatedRoute, 
    private usersServerService: UsersServerService,
    private router: Router) { }

  ngOnInit(): void {
    // cez paramMap pocuvame na zmenu parametra id (preklik na ineho usera)
    this.route.paramMap.pipe(
      // switchMap - ak sa nestihli ziskat data z funkcie vnutri switchMap, urobi sa novy request
      switchMap((params: ParamMap) => {
        return this.usersServerService.getUser(+params.get("id")) //+ zmeni string na number
      })
    ).subscribe((user: User) => {
      this.userToEdit = user;
    })
  }

  // posle komponentu usera, ktoreho treba menit cez: <app-user-edit-child [user]="user"></app-user-edit-child>

  saveUser(user: User) {
    this.usersServerService.saveUser(user).subscribe(
      () => this.router.navigateByUrl("/extended-users"))
  }
}
