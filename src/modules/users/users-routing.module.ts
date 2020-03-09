import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UsersListComponent } from './users-list/users-list.component';
import { ExtendedUsersComponent } from './extended-users/extended-users.component';
import { EditUserComponent } from './edit-user/edit-user.component';
import { AuthGuard } from 'src/guards/guards/auth.guard';
import { CanDeactivateGuard } from 'src/guards/can-deactivate.guard';
import { UserResolverService } from 'src/guards/user-resolver.service';

const routes: Routes = [
  {path: "users", component: UsersListComponent},
  {path: "extended-users", component: ExtendedUsersComponent, canActivate:[AuthGuard]},
  {path: "users/edit/:id", component: EditUserComponent, 
    canActivate:[AuthGuard], 
    canDeactivate:[CanDeactivateGuard],
    resolve: {
      user: UserResolverService
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UsersRoutingModule { }
