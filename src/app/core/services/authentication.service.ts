import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { JwtAuth } from '../../models/JwtAuth';
import { Login } from '../../models/Login';
import { Register } from '../../models/Register';
import { Store } from '@ngrx/store';
import { clearUser, setUser } from '../../store/user/user.actions';
import { jwtDecode } from 'jwt-decode';
import { Client } from '../../models/Client';
import { UserService } from './client-service.service';
import { clearCart } from '../../store/cart/cart.actions';
interface DecodedToken {
    ClientId: number;
    UserName: string;
    sub: string;
    email: string;
    exp: number;
    jti: string;
    role: string;
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
        private store: Store,
        private userService: UserService
    ) {
        // Check if user is already logged in on service initialization
        if (this.isAuthenticated()) {
            this.StoreUser();
        }
    }

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
        localStorage.removeItem('cart');
        this.store.dispatch(clearUser());
        this.store.dispatch(clearCart());
        this.authStatusSubject.next(false);
    }

    isAuthenticated(): boolean {
        const token = this.getToken();
        return token ? !this.isTokenExpired(token) : false;
    }
    getUserRole(): string {
        const token = this.getToken();
        const decodedToken = jwtDecode<DecodedToken>(token!);
        console.log(decodedToken.role);
        return decodedToken.role;
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

    //store user in store
    StoreUser() {
        //decode JWt to user
        const token = this.getToken();
        const decodedToken = jwtDecode<DecodedToken>(token!);

        this.userService.getUserById(Number(decodedToken.ClientId)).subscribe((client) => {
            const clientData: Client = {
                tiersId: client.tiersId,
                tiersCode: client.tiersCode,
                tiersIntitule: client.tiersIntitule,
                tiersAdresse1: client.tiersAdresse1,
                tiersCodePostal: client.tiersCodePostal,
                tiersVille: client.tiersVille,
                tiersPays: client.tiersPays,
                tiersTel1: client.tiersTel1
            };
            //console.log('clientData:', clientData);
            this.store.dispatch(setUser({ client: clientData }));
        });
    }
}
