import { Component } from '@angular/core';
import { CarouselModule } from 'primeng/carousel';
interface CarouselItem {
    image: string;
    title: string;
    subtitle: string;
    link: string;
}

@Component({
    selector: 'app-ads-carousel',
    imports: [CarouselModule],
    templateUrl: './ads-carousel.component.html',
    styleUrl: './ads-carousel.component.css'
})
export class AdsCarouselComponent {
    // Carousel items
    carouselItems: CarouselItem[] = [];
    carouselResponsiveOptions = [
        {
            breakpoint: '1199px',
            numVisible: 1,
            numScroll: 1
        }
    ];
    ngOnInit() {
        this.initCarouselItems();
    }
    initCarouselItems() {
        this.carouselItems = [
            {
                image: 'assets/promo/ad6.png',
                title: 'New Arrivals',
                subtitle: 'Check out our latest products',
                link: '/products?sort=newest'
            },

            {
                image: 'assets/promo/ad4_1.jpg',
                title: 'Seasonal Collection',
                subtitle: 'Discover our seasonal items',
                link: '/products?category=seasonal'
            },
            {
                image: 'assets/promo/ad5.jpg',
                title: 'Special Offers',
                subtitle: 'Limited time discounts',
                link: '/products?category=promotion'
            }
        ];
    }
}
