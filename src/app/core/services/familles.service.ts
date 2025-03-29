import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Famille } from '../../models/Famille';

@Injectable({
    providedIn: 'root'
})
export class FamillesService {
    constructor(private http: HttpClient) {}

    getFamilles() {
        return this.http.get<Famille[]>('https://localhost:7257/api/Famille');
    }
}
