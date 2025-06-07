import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { Router, RouterModule } from '@angular/router';

@Component({
    selector: 'hero-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, RouterModule],
    template: /*html*/ `
        <div id="hero" class="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 to-indigo-900">
            <div class="absolute inset-0 bg-[url('https://public.readdy.ai/ai/img_res/eeb199e695d4efd5daaa5c17d08fd570.jpg')] opacity-40 bg-cover bg-center"></div>
            <div class="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent"></div>

            <div class="container mx-auto px-6 sm:px-8 h-full relative">
                <div class="flex items-center justify-start h-screen">
                    <div class="max-w-5xl text-white pt-20 md:pt-0">
                        <div class="mb-4 text-primary-400 font-medium tracking-widest uppercase text-sm">Apollo eCommerce</div>
                        <h1 class="text-5xl sm:text-6xl md:text-7xl font-extrabold leading-tight mb-6 text-white tracking-tight uppercase" style="line-height: 1.2;">Shopping Intelligent, Choix Plus Intelligents</h1>
                        <div class="w-20 h-1 bg-primary-500 mb-8"></div>
                        <p class="text-lg sm:text-xl opacity-90 leading-relaxed mb-10 text-white font-light tracking-wide max-w-xl">Découvrez l'avenir du e-commerce avec des recommandations alimentées par l'IA qui personnalisent votre expérience d'achat.</p>
                        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6">
                            <button (click)="navigate()" class="h-14 px-10 bg-white text-black hover:bg-gray-200 text-lg font-medium rounded-lg cursor-pointer transition-all duration-300 shadow-lg hover:shadow-xl">Commencer à Magasiner</button>
                            <button class="h-14 px-10 border-2 border-white text-white hover:bg-white/20 text-lg font-medium rounded-lg cursor-pointer transition-all duration-300">Explorer les Fonctionnalités</button>
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
