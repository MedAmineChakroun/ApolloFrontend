import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { TooltipModule } from 'primeng/tooltip';
import { RippleModule } from 'primeng/ripple';
import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { Product } from '../../../models/Product';
import { ToastrService } from 'ngx-toastr';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | undefined;

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, TagModule, SkeletonModule, TooltipModule, RippleModule],
    templateUrl: './product-details.component.html'
})
export class ProductDetailsComponent implements OnInit {
    product: Product | null = null;
    error: string | null = null;
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

    addToCart(product: Product) {
        this.cartService.addToCart(product);

        // Show success toast
        this.toastr.success(`${product.artIntitule} added to cart`, 'Added to Cart', {
            timeOut: 2000,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-bottom-right'
        });

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
