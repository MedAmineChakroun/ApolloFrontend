import { CommonModule } from '@angular/common';
import { Component, Input, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { ProductsService } from '../../../../core/services/products.service';
import { Product } from '../../../../models/Product';
import { Router } from '@angular/router';
import { StockService } from '../../../../core/services/stock.service';
import { Stock } from '../../../../models/Stock';

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-similar',
    imports: [ButtonModule, CommonModule, CarouselModule, GalleriaModule, ImageModule, TagModule],
    templateUrl: './similar.component.html',
    styleUrl: './similar.component.css',
    providers: [ProductsService, Router]
})
export class SimilarComponent {
    @Input() productFamille: string = '';
    @Input() productId: number = 0;
    products!: Product[];
    stocks: Stock[] = [];
    images!: any[];
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private productService: ProductsService,
        private router: Router,
        private stockService: StockService
    ) {}

    ngOnInit() {
        this.productService.getSimilarProductsByFamille(this.productFamille).subscribe((products) => {
            this.products = products.filter((product) => product.artId !== this.productId);
            this.stockService.getAllStock().subscribe((stockData) => {
                this.products = this.products.map((product) => {
                    const stock = stockData.find((s) => s.ArRef === product.artCode);

                    return { ...product, stockQuantity: stock?.AsQteSto ?? 0 };
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
    navigateToProductDetails(productId: string) {
        this.router.navigate(['/store/products', productId]);
    }
}
