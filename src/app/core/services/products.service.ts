import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/Product';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    constructor(private http: HttpClient) {}

    getProducts() {
        return this.http.get<Product[]>('https://localhost:7257/api/Produits');
    }
    getProductsByFamille(famille?: string) {
        return this.http.get<Product[]>(`https://localhost:7257/api/Produits/byFamille?famille=${famille}`);
    }
    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`https://localhost:7257/api/Produits/${id}`);
    }
    getProductsNumber(): Observable<number> {
        return this.http.get<number>('https://localhost:7257/api/Produits/count');
    }
    /**
     * Extract products from API response, handling different response formats
     * @param response API response
     * @returns Array of products
     */
    private extractProducts(response: any): Product[] {
        // Handle different response formats
        if (response?.data?.produits) {
            return response.data.produits;
        } else if (Array.isArray(response)) {
            return response;
        } else if (response?.data && Array.isArray(response.data)) {
            return response.data;
        } else if (response?.produits && Array.isArray(response.produits)) {
            return response.produits;
        }

        console.warn('Unexpected API response format:', response);
        return [];
    }

    /**
     * Gets unique product families/categories from all products
     * @returns Observable of unique product family strings
     */
    getUniqueFamilies(): Observable<string[]> {
        return this.getProducts().pipe(
            map((response: any) => {
                const products = this.extractProducts(response);

                // Extract only products with valid famille property
                const validProducts = products.filter((product) => product && product.artFamille && typeof product.artFamille === 'string');

                // Extract unique families using a Set and explicitly type as string
                const uniqueFamilies = [...new Set(validProducts.map((product) => product.artFamille))] as string[];
                return uniqueFamilies.sort(); // Sort alphabetically
            }),
            catchError((error) => {
                console.error('Error fetching product families:', error);
                return of([] as string[]);
            })
        );
    }
}
