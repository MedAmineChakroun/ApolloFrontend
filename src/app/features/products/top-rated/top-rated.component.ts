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

type TagSeverity = 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' | undefined;

@Component({
    selector: 'app-top-rated',
    imports: [FormsModule, ButtonModule, CommonModule, CarouselModule, GalleriaModule, ImageModule, TagModule, RatingModule],
    templateUrl: './top-rated.component.html',
    styleUrl: './top-rated.component.css',
    providers: [ProductsService, Router]
})
export class TopRatedComponent {
    products!: Product[];
    ratedProducts: { article: Product; averageRating: number; ratingCount: number }[] = [];

    images!: any[];
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';
    constructor(
        private productServices: ProductsService,
        private router: Router
    ) {}

    ngOnInit() {
        this.productServices.getTopRatedProducts().subscribe((response) => {
            this.ratedProducts = response.products;
            this.products = response.products.map((item) => item.article);
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
