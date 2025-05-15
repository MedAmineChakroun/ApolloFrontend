import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../../models/Product';
import { map, catchError, switchMap } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { ProductDto } from '../../models/Dtos/ProductDto';

@Injectable({
    providedIn: 'root'
})
export class ProductsService {
    private apiUrl = 'https://localhost:7257/api/Produits';
    private uploadUrl = 'https://localhost:7257/api/Upload';

    constructor(private http: HttpClient) {}

    getProducts() {
        return this.http.get<Product[]>(this.apiUrl);
    }

    getProductsByFamille(famille?: string) {
        return this.http.get<Product[]>(`${this.apiUrl}/byFamille?famille=${famille}`);
    }

    getProductById(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/${id}`);
    }

    getProductsNumber(): Observable<number> {
        return this.http.get<number>(`${this.apiUrl}/count`);
    }

    getProductsByCode(code: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/Code/${code}`);
    }

    getTopSalesProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/topSales/${20}`);
    }

    getTopRatedProducts(): Observable<{ products: { article: Product; averageRating: number; ratingCount: number }[]; count: number }> {
        return this.http.get<{ products: { article: Product; averageRating: number; ratingCount: number }[]; count: number }>(`${this.apiUrl}/toprated/${20}`);
    }

    getSimilarProductsByFamille(famille: string): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/similar/${famille}/${10}`);
    }

    createProduct(productDto: ProductDto): Observable<ProductDto> {
        return this.http.post<ProductDto>(this.apiUrl, productDto);
    }

    editProduct(product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/${product.artId}`, product);
    }

    deleteProduct(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    }

    uploadProductImage(file: File): Observable<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('FileName', file.name);

        // Updated to match the backend controller's response format
        return this.http.post<{ fileName: string; filePath: string; fileSize: number }>(this.uploadUrl, formData).pipe(
            map((response) => {
                console.log('Upload response:', response);
                // Use the full file path returned from the server
                return response.fileName;
            }),
            catchError((err) => {
                console.error('Upload failed', err);
                return of('');
            })
        );
    }

    createProductWithImage(productDto: ProductDto, imageFile?: File): Observable<ProductDto> {
        if (imageFile) {
            return this.uploadProductImage(imageFile).pipe(
                switchMap((imagePath) => {
                    productDto.artImageUrl = imagePath; // Store the full path returned from the server
                    return this.createProduct(productDto);
                })
            );
        } else {
            console.log('No image file provided, creating product without image.');
            return this.createProduct(productDto);
        }
    }

    updateProductWithImage(product: Product, imageFile?: File): Observable<Product> {
        if (imageFile) {
            return this.uploadProductImage(imageFile).pipe(
                switchMap((imagePath) => {
                    product.artImageUrl = imagePath; // Store the full path returned from the server
                    return this.editProduct(product);
                })
            );
        } else {
            return this.editProduct(product);
        }
    }
    getRecommendedProducts(userID: string, limit: number): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/recommendations/${userID}/${limit}`);
    }
    getRecommendedProductsForCart(itemIds: string[], count: number = 5): Observable<Product[]> {
        const requestBody = {
            item_ids: itemIds,
            count: count
        };

        return this.http.post<Product[]>(`${this.apiUrl}/recommendations/cart`, requestBody);
    }
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
