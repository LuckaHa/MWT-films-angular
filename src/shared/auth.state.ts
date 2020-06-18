import { State, Action, StateContext, Selector } from '@ngxs/store';
import { Login, Logout, UrlAfterLogin, TokenExpiredLogout } from './auth.actions';
import { UsersServerService } from 'src/services/users-services.service';
import { tap } from 'rxjs/operators';
import { Injectable } from '@angular/core';

const DEFAULT_REDIRECT_AFTER_LOGIN = "/users/extended";

export interface AuthModel {
    username: string;
    token: string;
    redirectAfterLogin: string;
}

@State<AuthModel> ({
    name: "auth",
    defaults: { username: null, token: null, redirectAfterLogin: DEFAULT_REDIRECT_AFTER_LOGIN }
})
@Injectable()
export class AuthState {

    @Selector([state => state.auth.redirectAfterLogin])
        static redirectUrl(url: string) {
        return url;
    }

    constructor(private usersServerService: UsersServerService){}

    ngxsOnInit() {
        this.usersServerService.checkToken().subscribe();
    }

    @Action(Login)
    login(ctx: StateContext<AuthModel>, action: Login) {
        console.log("spracovavam Login pre meno " + action.auth.name);
        return this.usersServerService.login(action.auth).pipe(
            tap(token => {
                ctx.patchState({ // menime len cast, redirect nie
                    username: action.auth.name,
                    token: token
                }); 
            })
        );
    }

    @Action([Logout, TokenExpiredLogout], { cancelUncompleted: true })
    logout(ctx: StateContext<AuthModel>, action: Logout | TokenExpiredLogout) {
        // potrebujeme nastavit stav po odhlaseni a zavolat logout v service
        const token = ctx.getState().token;
        ctx.setState({
            username: null,
            token: null,
            redirectAfterLogin: DEFAULT_REDIRECT_AFTER_LOGIN
        });
        if (action instanceof Logout) return this.usersServerService.logout(token);
        // v pripade TokenExpiredLogout uz server nema token, takze ho netreba kontaktovat
    }

    @Action(UrlAfterLogin)
    setUrlAfterLogin(ctx: StateContext<AuthModel>, action: UrlAfterLogin) {
        ctx.patchState({
            redirectAfterLogin: action.url
        })
    }
}