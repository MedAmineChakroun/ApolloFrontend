import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private apiUrl = 'https://localhost:7257/api/User';

    constructor(private http: HttpClient) {}

    getUsers(): Observable<any> {
        return this.http.get<any>(this.apiUrl);
    }
    // GET /api/user/{id}
    getUserProfile(id: string): Observable<any> {
        return this.http.get<any>(`${this.apiUrl}/${id}`);
    }

    // PUT /api/user/{id}
    updateUserProfile(id: string, data: any): Observable<any> {
        return this.http.put(`${this.apiUrl}/${id}`, data);
    }
    // DELETE /api/user/{id}
    deleteUserProfile(id: string): Observable<any> {
        return this.http.delete(`${this.apiUrl}/${id}`);
    }
}
