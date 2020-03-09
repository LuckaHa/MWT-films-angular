import { Injectable } from '@angular/core';
import { User } from 'src/entities/user';
import { of, Observable, throwError, EMPTY, Subscriber } from 'rxjs';
import { map, catchError, mapTo } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Auth } from 'src/entities/auth';
import { SnackbarService } from './snackbar.service';
import { Group } from 'src/entities/group';

@Injectable({
  providedIn: 'root'
})
export class UsersServerService {
  
  localUsers = [new User("Janka", "janka@gmail.sk"), new User("Danka", "danka@gmail.sk")];
  loggedUserSubscriber: Subscriber<string>;
  url = "http://localhost:8080/";
  redirectAfterLogin = "/extended-users";

  constructor(private http: HttpClient, private snackbarService: SnackbarService) { }

  //private token: string = null; // uz budeme token ziskavat z lok. uloziska
  get token(): string {
    return localStorage.getItem("token");
  }

  set token(token: string) {
    if (token) {
      localStorage.setItem("token", token);
    } else {
      localStorage.removeItem("token");
    }
    
  }

  get user(): string {
    return localStorage.getItem("user");
  }

  set user(user: string) {
    if (user) {
      localStorage.setItem("user", user);
    } else {
      localStorage.removeItem("user");
    }  
  }

  getCurrentUser(): Observable<string> {
    return new Observable<string>(subscriber => {
      this.loggedUserSubscriber = subscriber;
      subscriber.next(this.user);
    })
  }

  getServerUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url + 'users') //v <> co vrati. mozno vyskusat v Postmanovi
      .pipe(catchError(error => this.httpError(error))); 
  }

  getExtendedUsers(): Observable<User[]> {
    return this.http.get<User[]>(this.url + "users/" + this.token)
      .pipe(catchError(error => this.httpError(error)));
  }

  getLocalUsers(): Observable<User[]> {
    return of(this.localUsers); //of - jednoduchy producent dat, kt. caka len 1 vystup (vieme, co bude tiect)
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(this.url + "user/" + id + "/" + this.token)
      .pipe(catchError(error => this.httpError(error)));
  }

  getGroups(): Observable<Group[]> {
    return this.http.get<Group[]>(this.url + "groups")
      .pipe(catchError(error => this.httpError(error)));
  }

  saveUser(user: User): Observable<User> {
    return this.http.post<User>(this.url + "users/" + this.token, user)
    .pipe(catchError(error => this.httpError(error)));
  }

  login(auth: Auth): Observable<boolean> {
    return this.http.post(this.url + "login", auth, { responseType: "text" })
    .pipe(map(token => {
      this.token = token; // zavola sa set token()
      this.user = auth.name;
      this.loggedUserSubscriber.next(this.user);
      this.snackbarService.successMessage("Login successful");
      return true;
    }),
    catchError(error => this.httpError(error)));
  }

  logout() {
    this.loggedUserSubscriber.next(null);
    this.http.get(this.url + "logout/" + this.token)
      .pipe(catchError(error => this.httpError(error)))
      .subscribe();
    this.user = null;
    this.token = null;
  }

  register(user: User): Observable<User> {
    return this.http
      .post<User>(this.url + "register", user)
      .pipe(catchError(error => this.httpError(error)));
  }

  deleteUser(userId: number): Observable<boolean> {
    return this.http
      .delete(this.url + "user/" + userId + "/" + this.token)
      .pipe(mapTo(true))
      .pipe(catchError(error => this.httpError(error)));
  }

  userConflicts(user: User): Observable<string[]> {
    return this.http.post<string[]>(this.url + "user-conflicts", user)
      .pipe(catchError(error => this.httpError(error)));
  }

  private httpError(error: any) {
    if (error instanceof HttpErrorResponse && error.status === 401) { // za && sa uz error pretypoval na HttpErrorResponse
      this.httpErrorMessage(error)
      return EMPTY; // vratim novu ruru s EMPTY miesto erroru na uzavretie prudu dat, uz nic ine nepride
    }
    return throwError(error);
  }

  private httpErrorMessage(error: HttpErrorResponse): void {
    console.log(JSON.stringify(error));
    if (error.status === 0) {
      this.snackbarService.errorMessage("Server is not available.");
      return;
    }
    if (error.status >= 401 && error.status < 500) {
      if (error.error.errorMessage) {
        this.snackbarService.errorMessage(error.error.errorMessage)
      } else { // niekedy sa stava, ze error.error nie je JSON a potrebujeme ho vyrobit (bug)
        this.snackbarService.errorMessage(JSON.parse(error.error).errorMessage);
      }
      return;
    }
    this.snackbarService.errorMessage("Server error: " + error.message); // error.status === 500
  }
}
