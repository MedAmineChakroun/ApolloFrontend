import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Famille } from '../../models/Famille';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class FamillesService {
    constructor(private http: HttpClient) {}

    getFamilles() {
        return this.http.get<Famille[]>('https://localhost:7257/api/Famille');
    }
    getFamillesNumber(): Observable<number> {
        return this.http.get<number>('https://localhost:7257/api/Famille/count');
    }
}
