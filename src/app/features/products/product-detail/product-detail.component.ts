import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputNumberModule } from 'primeng/inputnumber';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../models/Product';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-product-detail',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        ButtonModule,
        TagModule,
        InputNumberModule,
        ToastModule,
        ProgressSpinnerModule
    ],
    templateUrl: './product-detail.component.html',
    styleUrls: ['./product-detail.component.css'],
    providers: [MessageService]
})
export class ProductDetailComponent implements OnInit {
    product: Product | null = null;
    quantity: number = 1;
    readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductsService,
        private cartService: CartService,
        private messageService: MessageService
    ) {}

    ngOnInit() {
        const productId = this.route.snapshot.paramMap.get('id');
        console.log('Product ID from route:', productId);
        if (productId) {
            this.loadProductDetails(parseInt(productId));
        } else {
            console.error('No product ID found in route');
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Product ID not found'
            });
            this.router.navigate(['/products']);
        }
    }

    goBack() {
        this.router.navigate(['/products']);
    }

    getCategorySeverity(category: string): TagSeverity {
        const severityMap: { [key: string]: TagSeverity } = {
            'Electronics': 'success',
            'Clothing': 'info',
            'Books': 'warn',
            'Food': 'danger',
            'Other': 'secondary'
        };
        return severityMap[category] || 'contrast';
    }

    addToCart() {
        if (this.product && this.quantity > 0) {
            this.cartService.addToCart(this.product, this.quantity);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `${this.product.artIntitule} added to cart`
            });
        }
    }

    buyNow() {
        if (this.product) {
            this.cartService.addToCart(this.product, this.quantity);
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: `Proceeding to checkout with ${this.product.artIntitule}`
            });
            // TODO: Navigate to checkout page
        }
    }

    private loadProductDetails(productId: number) {
        console.log('Loading product details for ID:', productId);
        this.productService.getProductById(productId).subscribe({
            next: (response: any) => {
                console.log('API Response:', response);
                if (response && response.data) {
                    this.product = response.data;
                    console.log('Product details loaded:', this.product);
                } else {
                    console.error('Invalid response format:', response);
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Invalid product data received'
                    });
                    this.router.navigate(['/products']);
                }
            },
            error: (err: any) => {
                console.error('Error loading product details:', err);
                console.error('Error status:', err.status);
                console.error('Error message:', err.message);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: `Failed to load product details: ${err.message}`
                });
                this.router.navigate(['/products']);
            }
        });
    }

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    getStockStatus(stockValue: number): string {
        return stockValue > 0 ? 'IN STOCK' : 'OUT OF STOCK';
    }

    getStockSeverity(stockValue: number): TagSeverity {
        return stockValue > 0 ? 'success' : 'danger';
    }

    isOutOfStock(stockValue: number): boolean {
        return stockValue === 0;
    }

    handleImageError(event: Event) {
        const img = event.target as HTMLImageElement;
        img.src = this.DEFAULT_PRODUCT_IMAGE;
    }
}
