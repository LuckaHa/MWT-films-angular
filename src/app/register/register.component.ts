import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators, ValidatorFn, AbstractControl, ValidationErrors, AsyncValidatorFn } from '@angular/forms';
import * as zxcvbn from 'zxcvbn';
import { User } from 'src/entities/user';
import { Observable } from 'rxjs';
import { UsersServerService } from 'src/services/users-services.service';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
    passMessage: string = '';
    hidePass: boolean = true;
    registerForm = new FormGroup({
      name: new FormControl('', [Validators.required, Validators.minLength(3)],
        this.serverConflictValidator("name")),
      email: new FormControl('', [
        Validators.required, 
        Validators.email, 
        Validators.pattern(/^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/)
      ],
      this.serverConflictValidator("email")),
      password: new FormControl('', this.passwordValidator()),
      password2: new FormControl('')
    }, this.passwordsMatchValidator);

    constructor(private usersServerService: UsersServerService, private router: Router) { }

    ngOnInit(): void {
    }

    // metody ulahcujuce pracu v register.component.html
    get name() {
      return this.registerForm.get('name') as FormControl; //typu abstractControl, preto ho pretypujeme
    }

    get email() {
      return this.registerForm.get('email') as FormControl; 
    }

    get password() {
      return this.registerForm.get('password') as FormControl;
    }

    get password2() {
      return this.registerForm.get('password2') as FormControl;
    }

    stringify(text: string) {
      return JSON.stringify(text);
    }

    passwordValidator(): ValidatorFn { // vracia funkciu validatora
      // AbstractControl sa pouziva ak tam moze prist na vstupe FormControl, ale aj dacoIneControl 
      return (control: FormControl): ValidationErrors => { 
        const result = zxcvbn(control.value);
        const message = 'Password strength: ' + result.score + ' of 4 – must be 3 or 4 ' + result.feedback.warning
          + ' Can be cracked after ' + result.crack_times_display.offline_slow_hashing_1e4_per_second;
        this.passMessage = message;
        return result.score < 3 ? { weakPassword: message } : null;
      }
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
        const user = new User(username, email);
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
      const user = new User(
        this.name.value,
        this.email.value,
        undefined,
        undefined,
        this.password.value
      );
      this.usersServerService.register(user).subscribe(u => {
        this.router.navigateByUrl("/login");
      });
    }
}