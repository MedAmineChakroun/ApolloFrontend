import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/Product';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    constructor(private http: HttpClient) {}

    getProducts() {
        return this.http.get<Product[]>('https://localhost:7257/api/products');
    }
}
