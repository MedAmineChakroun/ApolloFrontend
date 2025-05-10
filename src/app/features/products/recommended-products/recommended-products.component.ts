import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { Product } from '../../../models/Product';
import { ProductsService } from '../../../core/services/products.service';
import { Router } from '@angular/router';
import { Stock } from '../../../models/Stock';
import { StockService } from '../../../core/services/stock.service';
import { selectUserCode } from '../../../store/user/user.selectors';
import { Store } from '@ngrx/store';
import { SkeletonModule } from 'primeng/skeleton';
import { finalize } from 'rxjs';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-recommended-products',
    imports: [ButtonModule, CommonModule, CarouselModule, GalleriaModule, ImageModule, TagModule, SkeletonModule],
    templateUrl: './recommended-products.component.html',
    styleUrl: './recommended-products.component.css',
    providers: [ProductsService]
})
export class RecommendedProductsComponent {
    products!: Product[];
    stocks: Stock[] = [];
    images!: any[];
    userCode: string = '0';
    isLoading: boolean = true;
    skeletonItems: number[] = Array(5).fill(0);
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';
    constructor(
        private productService: ProductsService,
        private router: Router,
        private stockService: StockService,
        private Store: Store
    ) {}
    getUserCode() {
        this.isLoading = true;
        this.Store.select(selectUserCode).subscribe((userCode) => {
            this.userCode = userCode ?? '0';
            console.log('User code:', this.userCode);
            this.productService
                .getRecommendedProducts(this.userCode ?? null, 10)
                .pipe(
                    finalize(() => {
                        // This will execute when the observable completes or errors
                        setTimeout(() => {
                            this.isLoading = false;
                        }, 300); // Small delay for a smoother transition
                    })
                )
                .subscribe((products) => {
                    this.products = products;

                    this.stockService.getAllStock().subscribe((stockData) => {
                        this.products = this.products.map((product) => {
                            const stock = stockData.find((s) => s.arRef === product.artCode);

                            return { ...product, stockQuantity: stock?.asQteSto ?? 0 };
                        });
                    });
                });
        });
    }
    ngOnInit() {
        this.getUserCode();
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
            breakpoint: '1200px',
            numVisible: 4,
            numScroll: 1
        },
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
    navigateToProductDetails(productId: string) {
        this.router.navigate(['/store/products', productId]);
    }
}
