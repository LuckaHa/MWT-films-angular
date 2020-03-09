import { Component, OnInit, Input, OnChanges, Output, EventEmitter } from '@angular/core';
import { User } from 'src/entities/user';
import { FormGroup, Validators, FormControl, AsyncValidatorFn, ValidationErrors, Form, FormArray } from '@angular/forms';
import { UsersServerService } from 'src/services/users-services.service';
import { Router } from '@angular/router';
import { Observable, using } from 'rxjs';
import { map } from 'rxjs/operators';
import { Group } from 'src/entities/group';

@Component({
  selector: 'app-user-edit-child',
  templateUrl: './user-edit-child.component.html',
  styleUrls: ['./user-edit-child.component.css']
})
export class UserEditChildComponent implements OnChanges {
  @Input() user: User; // toto je [user] v html
  // na zaciatku je undefined, az po OnInit v edit-user je nastaveny --> odchytime zmenu user: OnChanges()
  @Output() changedUser = new EventEmitter<User>();
  groups: Group[];
  hidePass: boolean = true;
  userEditForm = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.minLength(3)],
      this.serverConflictValidator("name")),
    email: new FormControl('', [
      Validators.required, 
      Validators.email, 
      Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)
    ],
    this.serverConflictValidator("email")),
    password: new FormControl(''),
    password2: new FormControl(''),
    active: new FormControl(true),
    groups: new FormArray([]) // dynamicke pridavanie skupin --> FormArray
  }, this.passwordsMatchValidator);

  constructor(private usersServerService: UsersServerService, private router: Router) { }

  // ked sa zmeni @Input
  ngOnChanges(): void {
    if (this.user) { // ak uz je user definovany
      this.name.setValue(this.user.name);
      this.email.setValue(this.user.email);
      this.active.setValue(this.user.active);
      this.usersServerService.getGroups().subscribe(groups => {
        this.groups = groups;
        groups.forEach(gr => {
          if (this.user.groups.some(ug => ug.id === gr.id)) {
            this.groupsCheckboxes.push(new FormControl(true)); // pridame do pola, ze je clenom i-tej skupiny
          } else {
            this.groupsCheckboxes.push(new FormControl(false));
          }
        });
      })
    }
  }

  // metody ulahcujuce pracu v register.component.html
  get name() {
    return this.userEditForm.get('name') as FormControl; //typu abstractControl, preto ho pretypujeme
  }

  get email() {
    return this.userEditForm.get('email') as FormControl; 
  }

  get password() {
    return this.userEditForm.get('password') as FormControl;
  }

  get password2() {
    return this.userEditForm.get('password2') as FormControl;
  }

  get active() {
    return this.userEditForm.get('active') as FormControl;
  }

  get groupsCheckboxes() {
    return this.userEditForm.get('groups') as FormArray;
  }

  stringify(text: string) {
    return JSON.stringify(text);
  }


  // tento sa pouzije na cely formular, lebo na vstupe potrebujem FormGroup 
  // a nezaujima ma password2, len to, ci je rovnake ako password
  passwordsMatchValidator(control: FormGroup): ValidationErrors {
    const password = control.get('password');
    const password2 = control.get('password2');
    if (password.value === password2.value) {
      password2.setErrors(null); // nastavime, ze nema chyby
      return null;
    } else {
      password2.setErrors({ differentPasswords: 'Passwords do not match' });
      return { 
        differentPasswords: 'Passwords do not match' 
      };
    }
  }

  // conflictFieldName - v com je konflikt
  serverConflictValidator(conflictFieldName: string): AsyncValidatorFn {
    return (control: FormControl): Observable<ValidationErrors> => {
      const username = conflictFieldName === 'name' ? control.value : '';
      const email = conflictFieldName === 'email' ? control.value : '';
      const user = new User(username, email, this.user.id);
      // useru dodame aj jeho id, aby nehlasil konfkikt sam so sebou, ze uz taky user existuje
      return this.usersServerService.userConflicts(user).pipe(
        map(conflictsArray => {
          return conflictsArray.includes(conflictFieldName) ? {
            conflictField: conflictFieldName + " already is on the server"
          } : null;
        })
      );
    }
  }

  formSubmit() {
    //debugger; //tymto prikazom umoznime debugg v prehliadaci, dalsie breakpointy pridavame gulickou
    const user = new User(
      this.name.value,
      this.email.value,
      this.user.id,
      undefined /* last login */,
      this.password.value.trim() ? this.password.value.trim() : null, //ak je v hesle nieco napisane, zmenime ho
      this.active.value,
      this.groups.filter((group, i) => this.groupsCheckboxes.at(i).value)
    );
    this.changedUser.next(user);
  }
}
