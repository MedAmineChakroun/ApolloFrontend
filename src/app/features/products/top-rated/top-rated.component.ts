import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { ProductsService } from '../../../core/services/products.service';
import { Product } from '../../../models/Product';
import { RatingModule } from 'primeng/rating';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Stock } from '../../../models/Stock';
import { StockService } from '../../../core/services/stock.service';
import { CartService } from '../../../core/services/cart.service';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

// Define an interface for the rated product with stock
interface RatedProductWithStock {
    article: Product;
    averageRating: number;
    ratingCount: number;
    stockQuantity?: number;
}

@Component({
    selector: 'app-top-rated',
    imports: [FormsModule, ButtonModule, CommonModule, CarouselModule, GalleriaModule, ImageModule, TagModule, RatingModule],
    templateUrl: './top-rated.component.html',
    styleUrl: './top-rated.component.scss',
    providers: [ProductsService, StockService]
})
export class TopRatedComponent implements OnInit {
    ratedProducts: RatedProductWithStock[] = [];
    stocks: Stock[] = [];
    images!: any[];
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private productServices: ProductsService,
        private router: Router,
        private stockService: StockService,
        private cartService: CartService
    ) {}

    ngOnInit() {
        this.productServices.getTopRatedProducts().subscribe((response) => {
            this.ratedProducts = response.products;
            this.stockService.getAllStock().subscribe((stockData) => {
                this.ratedProducts = this.ratedProducts.map((product) => {
                    const stock = stockData.find((s) => s.arRef === product.article.artCode);

                    return { ...product, stockQuantity: stock?.asQteSto ?? 0 };
                });
            });
        });
    }

    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    getSeverity(stockQty: number | undefined): TagSeverity {
        const stock = stockQty || 0;
        if (stock == 0) return 'danger';
        if (stock <= 10) return 'warn';
        return 'success';
    }

    getSeverityValue(stockQty: number | undefined): string {
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
    carouselResponsiveOptions: any[] = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 3
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '560px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    addToCart(product: Product) {
        this.cartService.addToCart(product);

        // Add animation to cart icon (optional)
        const cartIcon = document.querySelector('.cart-icon');
        if (cartIcon) {
            cartIcon.classList.add('animate-bounce');
            setTimeout(() => {
                cartIcon.classList.remove('animate-bounce');
            }, 1000);
        }
    }
    navigateToProductDetails(productId: string) {
        this.router.navigate(['/store/products', productId]);
    }
}
