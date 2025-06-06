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
import { StockService } from '../../../core/services/stock.service';
import { Stock } from '../../../models/Stock';
import { CommandeService } from '../../../core/services/commande.service';
import { Store } from '@ngrx/store';
import { selectUserCode } from '../../../store/user/user.selectors';
//import lazy loading for the image module from primeng

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
    stockQuantity: number = 0;
    tiersCode: string = '';
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private route: ActivatedRoute,
        private productsService: ProductsService,
        private cartService: CartService,
        private toastr: ToastrService,
        private stockService: StockService,
        private CommandeService: CommandeService,
        private store: Store
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
        // Reset product and stock data first
        this.product = null;
        this.stockQuantity = 0;
        this.quantity = 1;
        this.error = null;

        const id = parseInt(productId, 10);
        if (isNaN(id)) {
            this.error = 'Invalid product ID';
            return;
        }

        this.productsService.getProductById(id).subscribe({
            next: (response: any) => {
                if (response) {
                    this.product = response;
                    this.stockService.getStockByCode(response.artCode).subscribe({
                        next: (stockData) => {
                            this.stockQuantity = stockData.asQteSto;
                        },
                        error: (err) => {
                            console.error('Error loading stock data:', err);
                            this.stockQuantity = 0; // Set to 0 if there's an error loading stock
                        }
                    });
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

    getStockSeverity(stockQty: number | undefined): TagSeverity {
        const stock = stockQty || 0;
        if (stock == 0) return 'danger';
        if (stock <= 10) return 'warn';
        return 'success';
    }

    getStockStatus(stockQty: number | undefined): string {
        const stock = stockQty || 0;
        if (stock == 0) return 'Rupture';
        if (stock <= 10) return 'Faible';
        return 'Disponible';
    }

    getStockIcon(stockQty: number | undefined): string {
        const stock = stockQty || 0;
        if (stock == 0) return 'pi pi-exclamation-circle';
        if (stock <= 10) return 'pi pi-info-circle';
        return 'pi pi-check-circle';
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
