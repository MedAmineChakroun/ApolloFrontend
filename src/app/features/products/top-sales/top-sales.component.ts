import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { Product } from '../../../models/Product';
import { ProductsService } from '../../../core/services/products.service';
import { StockService } from '../../../core/services/stock.service';
import { Router } from '@angular/router';
import { Stock } from '../../../models/Stock';
import { CartService } from '../../../core/services/cart.service';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-top-sales',
    imports: [ButtonModule, CommonModule, CarouselModule, GalleriaModule, ImageModule, TagModule],
    templateUrl: './top-sales.component.html',
    styleUrl: './top-sales.component.css',
    providers: [ProductsService, StockService]
})
export class TopSalesComponent implements OnInit {
    products!: Product[];
    stocks: Stock[] = [];
    images!: any[];
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private productService: ProductsService,
        private router: Router,
        private stockService: StockService,
        private cartService: CartService
    ) {}

    ngOnInit() {
        this.productService.getTopSalesProducts().subscribe((products) => {
            this.products = products;

            this.stockService.getAllStock().subscribe((stockData) => {
                this.products = this.products.map((product) => {
                    const stock = stockData.find((s) => s.arRef === product.artCode);

                    return { ...product, stockQuantity: stock?.asQteSto ?? 0 };
                });
            });
        });
    }
    handleProductImageError(event: any): void {
        event.target.src = this.DEFAULT_PRODUCT_IMAGE;
    }

    getSeverity(stockValue: number): TagSeverity {
        return stockValue > 0 ? 'success' : 'danger';
    }
    getSeverityValue(stockValue: number): string {
        return stockValue > 0 ? 'En Stock' : 'Sold out';
    }
    carouselResponsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 3,
            numScroll: 1
        },
        {
            breakpoint: '768px',
            numVisible: 2,
            numScroll: 1
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
