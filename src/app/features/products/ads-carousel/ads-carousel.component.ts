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
    ngOnInit() {}
}
