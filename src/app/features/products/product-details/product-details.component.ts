import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { ToastrService } from 'ngx-toastr';
import { CartService } from '../../../core/services/cart.service';
// import { WishlistService } from '../../../core/services/wishlist.service';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../models/Product';
import { RippleModule } from 'primeng/ripple';
import { SkeletonModule } from 'primeng/skeleton';

@Component({
    selector: 'app-product-details',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, CardModule, TagModule, RippleModule, SkeletonModule],
    templateUrl: './product-details.component.html',
    styleUrls: ['./product-details.component.css']
})
export class ProductDetailsComponent implements OnInit {
    product: Product | null = null;
    error: string | null = null;
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productService: ProductsService,
        private cartService: CartService,
        // private wishlistService: WishlistService,
        private toastr: ToastrService
    ) {}

    ngOnInit() {
        const productId = this.route.snapshot.paramMap.get('id');
        if (productId) {
            this.loadProductDetails(productId);
        } else {
            this.error = 'Product ID not found';
        }
    }

    loadProductDetails(productId: string) {
        const id = parseInt(productId, 10);
        if (isNaN(id)) {
            this.error = 'Invalid product ID';
            return;
        }
        this.productService.getProductById(id).subscribe({
            next: (response: any) => {
                if (response) {
                    this.product = response;
                } else {
                    this.error = 'Product not found';
                }
            },
            error: (error) => {
                console.error('Error loading product details:', error);
                this.error = 'Failed to load product details. Please try again later.';
            }
        });
    }

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    addToCart(product: Product) {
        this.cartService.addToCart(product);
        this.toastr.success(`${product.artIntitule} added to cart`, 'Added to Cart', {
            timeOut: 2000,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
        });
    }

    // toggleWishlist(product: Product) {
    //     if (this.isInWishlist(product)) {
    //         this.wishlistService.removeFromWishlist(product);
    //         this.toastr.info(`${product.artIntitule} removed from wishlist`, 'Removed from Wishlist', {
    //             timeOut: 2000,
    //             progressBar: true,
    //             progressAnimation: 'increasing',
    //             positionClass: 'toast-top-right'
    //         });
    //     } else {
    //         this.wishlistService.addToWishlist(product);
    //         this.toastr.success(`${product.artIntitule} added to wishlist`, 'Added to Wishlist', {
    //             timeOut: 2000,
    //             progressBar: true,
    //             progressAnimation: 'increasing',
    //             positionClass: 'toast-top-right'
    //         });
    //     }
    // }

    // isInWishlist(product: Product): boolean {
    //    return this.wishlistService.isInWishlist(product);
    // }

    getStockStatus(stockValue: number): string {
        return stockValue > 0 ? 'IN STOCK' : 'OUT OF STOCK';
    }

    getStockSeverity(stockValue: number): 'success' | 'danger' {
        return stockValue > 0 ? 'success' : 'danger';
    }

    isOutOfStock(stockValue: number): boolean {
        return stockValue === 0;
    }
}
