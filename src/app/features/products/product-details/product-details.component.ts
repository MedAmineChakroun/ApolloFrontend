import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../models/Product';
import { ToastrService } from 'ngx-toastr';
import { RatingModule } from 'primeng/rating';
import { RatingComponent } from './rating/rating.component';
import { SimilarComponent } from './similar/similar.component';
import { ImageModule } from 'primeng/image';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | undefined;

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [ImageModule, SimilarComponent, RatingComponent, RatingModule, CommonModule, RouterModule, ButtonModule, TagModule, SkeletonModule, TooltipModule, RippleModule, FormsModule],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
    product: Product | null = null;
    error: string | null = null;
    quantity: number = 1;
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private route: ActivatedRoute,
        private productsService: ProductsService,
        private cartService: CartService,
        private toastr: ToastrService
    ) {}

    ngOnInit() {
        this.route.params.subscribe((params) => {
            const productId = params['id'];
            if (productId) {
                this.loadProduct(productId);
            }
        });
    }

    private loadProduct(productId: string) {
        const id = parseInt(productId, 10);
        if (isNaN(id)) {
            this.error = 'Invalid product ID';
            return;
        }

        this.productsService.getProductById(id).subscribe({
            next: (response: any) => {
                if (response?.data) {
                    this.product = response.data;
                } else if (response) {
                    this.product = response;
                } else {
                    this.error = 'Product not found';
                }
            },
            error: (err) => {
                console.error('Error loading product:', err);
                this.error = 'Failed to load product details';
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

    incrementQuantity(): void {
        this.quantity += 1;
    }

    decrementQuantity(): void {
        if (this.quantity > 1) {
            this.quantity -= 1;
        }
    }

    addToCart(product: Product) {
        // Add specified quantity to cart
        for (let i = 0; i < this.quantity; i++) {
            this.cartService.addToCart(product);
        }

        // Show success toast
        this.toastr.success(`${this.quantity} × ${product.artIntitule} added to cart`, 'Added to Cart', { timeOut: 3000 });

        // Reset quantity
        this.quantity = 1;

        // Add animation to cart icon (optional)
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('animate-bounce');
            setTimeout(() => {
                cartIcon.classList.remove('animate-bounce');
            }, 1000);
        }
    }
}
