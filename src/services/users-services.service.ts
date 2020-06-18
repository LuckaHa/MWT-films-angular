import { Injectable } from '@angular/core';
import { User } from 'src/entities/user';
import { of, Observable, throwError, EMPTY, Subscriber } from 'rxjs';
import { map, catchError, mapTo, tap } from 'rxjs/operators';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Auth } from 'src/entities/auth';
import { SnackbarService } from './snackbar.service';
import { Group } from 'src/entities/group';
import { Store } from '@ngxs/store';
import { TokenExpiredLogout } from 'src/shared/auth.actions';

@Injectable({
  providedIn: 'root'
})

export class UsersServerService {
  
  localUsers = [new User("Janka", "janka@gmail.sk"), new User("Danka", "danka@gmail.sk")];
  //loggedUserSubscriber: Subscriber<string>;
  url = "http://localhost:8080/";
  // redirectAfterLogin = "/users/extended";

  constructor(
    private http: HttpClient, 
    private snackbarService: SnackbarService,
    private store: Store
  ) {}

  get token(): string {
    return this.store.selectSnapshot(state => state.auth.token);
  }

  checkToken(): Observable<void> {
    if (this.token == null) return of(undefined);
    return this.http.get(this.url + "check-token/" + this.token, { responseType: "text" })
      .pipe(mapTo(undefined), catchError(error => this.httpError(error))); 
    // ak mame platny token, vratime void, inak je expirovany token -> logout a posleme chybu
  }

  /** 
  getCurrentUser(): Observable<string> {
    return new Observable<string>(subscriber => {
      this.loggedUserSubscriber = subscriber;
      subscriber.next(this.user);
    })
  }*/

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

  login(auth: Auth): Observable<string> {
    return this.http.post(this.url + "login", auth, { responseType: "text" })
    .pipe(tap(token => {
      // this.token = token; // zavola sa set token()
      // this.user = auth.name;
      //this.loggedUserSubscriber.next(this.user);
      this.snackbarService.successMessage("Login successful");
    }),
    catchError(error => this.httpError(error)));
  }

  logout(token?): Observable<void> {
    //this.loggedUserSubscriber.next(null);
    return this.http.get(this.url + "logout/" + token)
      .pipe(
        mapTo(undefined), // ked to bude uspesne, vrati to len undefined (uspech)
        catchError(error => this.httpError(error)));
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
      const message = error.error.errorMessage ? error.error.errorMessage : JSON.parse(error.error).errorMessage;
      if (error.status === 401 && message == "unknown token") { // 401 - unathorized access
        this.store.dispatch(new TokenExpiredLogout()); // do storage poslem akciu TokenExpiredLogout
        this.snackbarService.errorMessage("Session timeout");
        return;
      }
      this.snackbarService.errorMessage(message);
      return;
    }
    this.snackbarService.errorMessage("Server error: " + error.message); // error.status === 500
  }
}
