import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';
import { HttpClient } from '@angular/common/http';
import { Stock } from '../../models/Stock';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StockService {
    private apiUrl = environment.apiUrl + '/Stock';
    constructor(private http: HttpClient) {}

    getAllStock(): Observable<Stock[]> {
        return this.http.get<Stock[]>(`${this.apiUrl}`);
    }
    getStockByCode(Code: string): Observable<Stock> {
        return this.http.get<Stock>(`${this.apiUrl}/${Code}`);
    }
}
