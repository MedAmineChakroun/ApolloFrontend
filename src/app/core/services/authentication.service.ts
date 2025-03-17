import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { JwtAuth } from '../../models/JwtAuth';
import { Login } from '../../models/Login';
import { Register } from '../../models/Register';
import { User } from '../../models/user';
import { Store } from '@ngrx/store';
import { clearUser, setUser } from '../../store/user/user.actions';
import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
    Id: string;
    UserName: string;
    sub: string;
    email: string;
    exp: number;
    jti: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    private registerUrl = `${environment.apiUrl}/AuthManagement/Register`;
    private loginUrl = `${environment.apiUrl}/AuthManagement/Login`;
    private authStatusSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
    authStatus$ = this.authStatusSubject.asObservable();

    constructor(
        private http: HttpClient,
        private store: Store
    ) {}

    register(registerDto: Register): Observable<JwtAuth> {
        return this.http.post<JwtAuth>(this.registerUrl, registerDto).pipe(
            map((response) => {
                this.storeToken(response.token);
                this.authStatusSubject.next(true);
                return response;
            }),
            catchError(this.handleError)
        );
    }

    login(loginDto: Login): Observable<JwtAuth> {
        return this.http.post<JwtAuth>(this.loginUrl, loginDto).pipe(
            map((response) => {
                this.storeToken(response.token);
                this.StoreUser();
                this.authStatusSubject.next(true);
                return response;
            }),
            catchError(this.handleError)
        );
    }

    logout(): void {
        localStorage.removeItem('jwtToken');
        this.store.dispatch(clearUser());
        this.authStatusSubject.next(false);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        return token ? !this.isTokenExpired(token) : false;
    }
    getUserRole(): string {
        // return this.user.role;

        return 'user'; //test with customer role
    }
    private storeToken(token: string): void {
        localStorage.setItem('jwtToken', token);
    }

    private getToken(): string | null {
        return localStorage.getItem('jwtToken');
    }

    private isTokenExpired(token: string): boolean {
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 < Date.now();
        } catch (e) {
            return true;
        }
    }

    private handleError(error: any): Observable<never> {
        console.error('Authentication Error:', error);

        // For array responses (like password validation errors)
        if (Array.isArray(error.error)) {
            return throwError(() => error.error);
        }

        // For object responses with message
        if (error.error && typeof error.error === 'object') {
            if (error.error.message) {
                return throwError(() => error.error.message);
            } else if (error.error.errors) {
                return throwError(() => error.error.errors);
            }
        }

        // For string responses
        if (typeof error.error === 'string') {
            return throwError(() => error.error);
        }

        // Fallback
        return throwError(() => 'An unexpected error occurred');
    }

    private StoreUser() {
        //decode JWt to user
        const token = this.getToken();
        const decodedToken = jwtDecode<DecodedToken>(token!);

        const user: User = {
            id: decodedToken.Id,
            userName: decodedToken.UserName,
            email: decodedToken.email
        };
        this.store.dispatch(setUser({ user }));
    }
}
