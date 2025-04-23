import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { Product } from '../../../models/Product';
import { ProductsService } from '../../../core/services/products.service';
type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-top-sales',
    imports: [ButtonModule, CommonModule, CarouselModule, GalleriaModule, ImageModule, TagModule],
    templateUrl: './top-sales.component.html',
    styleUrl: './top-sales.component.css',
    providers: [ProductsService]
})
export class TopSalesComponent implements OnInit {
    products!: Product[];

    images!: any[];
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(private productService: ProductsService) {}

    ngOnInit() {
        this.productService.getTopSalesProducts().subscribe((products) => {
            console.log('Top Sales Products:', products);
            this.products = products;
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
}
