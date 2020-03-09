import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, ParamMap, Router } from '@angular/router';
import { UsersServerService } from 'src/services/users-services.service';
import { switchMap, map } from 'rxjs/operators';
import { User } from 'src/entities/user';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';
import { Observable } from 'rxjs';
import { CanComponentDeactivate } from 'src/guards/can-deactivate.guard';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.css']
})
export class EditUserComponent implements OnInit, CanComponentDeactivate {

  userToEdit: User; // nasetuje sa v ngOnInit
  userSaved = false;

  constructor(
    private route: ActivatedRoute, 
    private usersServerService: UsersServerService,
    private router: Router,
    private dialog: MatDialog) { }

  ngOnInit(): void {
    // cez paramMap pocuvame na zmenu parametra id (preklik na ineho usera)
    this.route.data.subscribe( (data) => {
      this.userToEdit = data.user;
      this.userSaved = false;
    })
    
    /** 
    this.route.paramMap.pipe(
      // switchMap - ak sa nestihli ziskat data z funkcie vnutri switchMap, urobi sa novy request
      switchMap((params: ParamMap) => {
        return this.usersServerService.getUser(+params.get("id")) //+ zmeni string na number
      })
    ).subscribe((user: User) => {
      this.userToEdit = user;
      this.userSaved = false;
    })
    */
  }

  // posle komponentu usera, ktoreho treba menit cez: <app-user-edit-child [user]="user"></app-user-edit-child>

  saveUser(user: User) {
    this.usersServerService.saveUser(user).subscribe(
      () => {
        this.router.navigateByUrl("/extended-users");
        this.userSaved = true;
      })
  }

  canDeactivate(): Observable<boolean> | boolean {
    // ak ulozil svoje zmeny, umoznime deaktivaciu, inak sa opytam, ci to naozaj chce
    if(this.userSaved) {
      return true;
    } 
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
      // objekt typu ConfirmDialogData, kt. ma 2 premenne: title, message
      title: "Leaving?",
      message: "Edited user is not saved, do you want to leave?"
    }}); // otvorime dialog

    return dialogRef.afterClosed().pipe(map((result) => !!result));
    // !! spravi z truthy true a z falsy false
  }
}
