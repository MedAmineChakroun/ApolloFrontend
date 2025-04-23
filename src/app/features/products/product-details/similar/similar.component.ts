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
    products!: Product[];

    images!: any[];
    private readonly DEFAULT_PRODUCT_IMAGE = 'assets/general/product-default.png';

    constructor(
        private productService: ProductsService,
        private router: Router
    ) {}

    ngOnInit() {
        this.productService.getSimilarProductsByFamille(this.productFamille).subscribe((products) => {
            console.log('similar:', products);
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
    navigateToProductDetails(productId: string) {
        this.router.navigate(['/store/products', productId]);
    }
}
