import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Client } from '../../models/Client';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://localhost:7257/api/Clients';

    constructor(private http: HttpClient) {}
    getUserById(id: number): Observable<Client> {
        return this.http.get<Client>(`${this.apiUrl}/${id}`);
    }
    getUserByCode(code: string): Observable<Client> {
        return this.http.get<Client>(`${this.apiUrl}/code/${code}`);
    }

    getUsers(): Observable<Client[]> {
        return this.http.get<Client[]>(this.apiUrl);
    }

    getUserProfile(id: number): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    updateUserProfile(id: number, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }

    deleteUserProfile(id: number): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
    getClientsNumber(): Observable<number> {
        return this.http.get<number>('https://localhost:7257/api/Clients/count');
    }
    getUserRole(id: number): Observable<any> {
        return this.http.get<string>(`${this.apiUrl}/role/${id}`);
    }
    updateUserFlag(id: number, flag: number): Observable<any> {
        return this.http.patch(`${this.apiUrl}/updateFlag/${id}?newFlag=${flag}`, null);
    }
}
