import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CarouselModule } from 'primeng/carousel';
import { GalleriaModule } from 'primeng/galleria';
import { ImageModule } from 'primeng/image';
import { TagModule } from 'primeng/tag';
import { Product, ProductService } from '../../../pages/service/product.service';
import { PhotoService } from '../../../pages/service/photo.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-recommended-products',
    imports: [ButtonModule, CommonModule, CarouselModule, GalleriaModule, ImageModule, TagModule],
    templateUrl: './recommended-products.component.html',
    styleUrl: './recommended-products.component.css',
    providers: [ProductService, PhotoService, Router]
})
export class RecommendedProductsComponent {
    products!: Product[];

    images!: any[];
    constructor(
        private productService: ProductService,
        private photoService: PhotoService,
        private router: Router
    ) {}

    ngOnInit() {
        this.productService.getProductsSmall().then((products) => {
            this.products = products;
        });

        this.photoService.getImages().then((images) => {
            this.images = images;
        });
    }

    getSeverity(status: string) {
        switch (status) {
            case 'INSTOCK':
                return 'success';
            case 'LOWSTOCK':
                return 'warn';
            case 'OUTOFSTOCK':
                return 'danger';
            default:
                return 'success';
        }
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
