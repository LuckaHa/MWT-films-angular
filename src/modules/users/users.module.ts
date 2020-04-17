import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { UsersListComponent } from './users-list/users-list.component';
import { ExtendedUsersComponent } from './extended-users/extended-users.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { UserEditChildComponent } from './user-edit-child/user-edit-child.component';
import { MaterialModule } from 'src/app/material.module';
import { ReactiveFormsModule } from '@angular/forms';
import { GroupsToStringPipe } from 'src/pipes/groups-to-string.pipe';
import { AddUserComponent } from './add-user/add-user.component';

@NgModule({
  declarations: [
    UsersListComponent,
    ExtendedUsersComponent,
    ConfirmDialogComponent,
    EditUserComponent,
    UserEditChildComponent,
    GroupsToStringPipe,
    AddUserComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MaterialModule,
    UsersRoutingModule
  ],
  entryComponents: [ConfirmDialogComponent], // dynamicky pridavany komponent
})
export class UsersModule { }
