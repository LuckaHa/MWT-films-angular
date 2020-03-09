import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { UsersServerService } from 'src/services/users-services.service';
import { User } from 'src/entities/user';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'app-extended-users',
  templateUrl: './extended-users.component.html',
  styleUrls: ['./extended-users.component.css']
})
export class ExtendedUsersComponent implements OnInit, AfterViewInit {
  
  columnsToDisplay = ["id", "name", "email", "lastLogin", "groups", "permissions", "deleteUser"]
  dataSource = new MatTableDataSource<User>();
  @ViewChild(MatPaginator) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;

  constructor(private usersServerService: UsersServerService,
    private dialog: MatDialog) { } // MatDialog - servis na dialog

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // definujeme vlastny sortovaci algoritmus
    this.dataSource.sortingDataAccessor = (user: User, headerName: string) => {
      switch (headerName) {
        case "groups":
          return user.groups[0] ? user.groups[0].name : ""; // podla 1. prvku abecedne
        default:
          return user[headerName];
      }
    }

    // ked zmenime, podla coho chceme filtrovat
    this.dataSource.filterPredicate = (user: User, filter: string) => {
      if (user.name.toLowerCase().includes(filter)) {
        return true;
      }
      for (let gr of user.groups) {
        if (gr.permissions.some(perm => perm.toLowerCase().includes(filter))) {
          return true;
        } //some() - vnorime sa do kazdej perm
        if (gr.name.toLowerCase().includes(filter)) {
          return true;
        }
        return false;
      }
    }

    this.usersServerService.getExtendedUsers().subscribe(users => {
      this.dataSource.data = users;
      this.paginator.length = users.length; // uz viem zistit, kolko je stran
    });
  }

  // filtrovanie podla value
  applyFilter(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
    this.paginator.firstPage(); // prehodenie na 1. stranku
  }

  deleteUser(user: User) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, { data: {
      // objekt typu ConfirmDialogData, kt. ma 2 premenne: title, message
      title: "Delete user",
      message: "Are you sure you want to delete user " + user.name + "?"
    }}); // otvorime dialog

    dialogRef.afterClosed().subscribe( result => {
      if (result) { // ak potvrdi, tak mazeme, inak nic
        this.usersServerService.deleteUser(user.id).subscribe(
          ok => {
            if (ok) { // ak sa podarilo zmazat
              // vezmem pole pouzivatelov (data) a nahradim pole novym polom bez tohto usera
              // aby zaregistroval zmenu a prekreslil stranku
              this.dataSource.data = this.dataSource.data.filter(u => u.id !== user.id);
            }
          }
        )
      }
    })
  }
}
