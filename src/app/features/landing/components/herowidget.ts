import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, RouterModule],
    template: /*html*/ `
        <div class="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-900">
            <div class="absolute inset-0 bg-[url('https://public.readdy.ai/ai/img_res/eeb199e695d4efd5daaa5c17d08fd570.jpg')] opacity-40 bg-cover bg-center "></div>
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>
            <div class="max-w-7xl mx-auto px-8 h-full relative">
                <div class="flex items-center h-full">
                    <div class="w-1/2 text-white">
                        <h1 class="text-7xl font-bold leading-tight mb-8 text-white">Smart Shopping, Smarter Choices</h1>
                        <p class="text-xl opacity-100 leading-relaxed mb-12 text-white">Discover the future of e-commerce with AI-powered recommendations that personalize your shopping experience.</p>
                        <div class="flex gap-6">
                            <button (click)="navigate()" class="h-14 px-10 bg-white text-black hover:bg-gray-200 text-lg font-medium rounded-lg cursor-pointer">Start Shopping</button>
                            <button class="h-14 px-10 border-2 border-white text-white hover:bg-white/10 text-lg font-medium rounded-lg cursor-pointer">Explore Features</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class HeroWidget {
    constructor(private router: Router) {}

    navigate() {
        this.router.navigate(['/store/products']);
    }
}
