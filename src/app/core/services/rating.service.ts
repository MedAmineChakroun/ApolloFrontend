import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Rate } from '../../models/Rate';

// Match the C# model exactly
export interface RatingDTO {
    productId: number;
    userId: number;
    stars: number;
}

@Injectable({
    providedIn: 'root'
})
export class RatingService {
    private apiUrl = environment.apiUrl + '/Ratings';
    constructor(private http: HttpClient) {}

    addRating(rating: RatingDTO): Observable<Rate> {
        return this.http.post<Rate>(`${this.apiUrl}`, rating);
    }

    // Récupérer une note pour un utilisateur et un produit
    getRatingForProduct(productId: number, userId: number): Observable<Rate> {
        return this.http.get<Rate>(`${this.apiUrl}/${productId}/${userId}`);
    }

    // Récupérer la moyenne des notes pour un produit
    getAverageRating(productId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/average/${productId}`);
    }
    getCountRating(productId: number): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/count/${productId}`);
    }
}
