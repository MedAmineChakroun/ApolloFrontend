// promo-banner.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CarouselModule } from 'primeng/carousel';
import { Router } from '@angular/router';

interface PromoItem {
    title: string;
    subtitle?: string;
    buttonText: string;
    imageUrl: string;
}

interface CarouselItem {
    title: string;
    subtitle: string;
    highlighedValue?: string;
    imageUrl: string;
    buttonText: string;
}

@Component({
    selector: 'app-promo-banner',
    standalone: true,
    imports: [CommonModule, CarouselModule],
    templateUrl: './promo-banner.component.html',
    styleUrls: ['./promo-banner.component.css']
})
export class PromoBannerComponent implements OnInit {
    promoItems: PromoItem[] = [
        {
            title: 'DES OFFRES SPÉCIALES',
            buttonText: 'Découvrir',
            imageUrl: 'assets/general/promo9.png'
        },
        {
            title: 'À NE PAS RATER',
            buttonText: 'Découvrir',
            imageUrl: 'assets/general/promo4.png'
        }
    ];

    rightPromoItems: PromoItem[] = [
        {
            title: 'PROMO :',
            subtitle: 'VOTRE DERNIÈRE CHANCE',
            buttonText: 'Découvrir',
            imageUrl: 'assets/general/promo5.png'
        },
        {
            title: 'NOUVEAUTÉ DU JOUR',
            buttonText: 'Découvrir',
            imageUrl: 'assets/general/promo.png'
        }
    ];

    carouselItems: CarouselItem[] = [
        {
            title: 'LIVRAISON GRATUITE',
            subtitle: 'A PARTIR DE',
            highlighedValue: '100 DT',
            imageUrl: 'assets/general/promo1.png',
            buttonText: 'Découvrir'
        },
        {
            title: 'SOLDES PRINTEMPS',
            subtitle: "JUSQU'À",
            highlighedValue: '50% OFF',
            imageUrl: 'assets/general/promo8.png',
            buttonText: 'Découvrir'
        },
        {
            title: 'NOUVEAUX ARRIVAGES',
            subtitle: 'DÉCOUVREZ',
            highlighedValue: 'TOP TECH',
            imageUrl: 'assets/general/promo6.png',
            buttonText: 'Découvrir'
        }
    ];

    responsiveOptions = [
        {
            breakpoint: '1024px',
            numVisible: 1,
            numScroll: 1
        }
    ];

    constructor(private router: Router) {}

    ngOnInit(): void {}
    navigateToProducts() {
        this.router.navigate(['/store/products']).then(() => {
            this.scrollToProductGrid();
        });
    }
    private scrollToProductGrid() {
        setTimeout(() => {
            const gridElement = document.getElementById('grid');
            if (gridElement) {
                const yOffset = -80; // adjust this based on sticky header height, etc.
                const y = gridElement.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'auto' }); // instant scroll
            }
        }, 300);
    }
}
