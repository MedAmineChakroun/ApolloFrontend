import { Component, HostListener } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../core/services/authentication.service';

@Component({
    selector: 'topbar-widget',
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, CommonModule],
    template: /*html*/ `
        <header [ngClass]="{ 'bg-transparent': !scrolled, 'bg-white/80 shadow-lg backdrop-blur-md': scrolled }" class="fixed top-0 left-0 w-full transition-all duration-300 z-50 p-0 m-0">
            <div class="flex items-center justify-between px-6 py-4 lg:px-12">
                <a class="flex items-center cursor-pointer" href="#">
                    <img src="assets/general/ApolloLogo.PNG" alt="logo" style="width: 45px" class="mr-4" />
                    <span [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="font-medium text-2xl leading-normal whitespace-nowrap transition">Apollo Store</span>
                </a>

                <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:!hidden">
                    <i class="pi pi-bars !text-2xl"></i>
                </a>

                <nav class="hidden lg:flex space-x-8">
                    <a (click)="router.navigate(['/landing'], { fragment: 'home' })" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer ">Home</a>

                    <a (click)="router.navigate(['/store/products'])" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer">Store</a>

                    <a (click)="router.navigate(['/landing'], { fragment: 'highlights' })" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer">About Us</a>

                    <a (click)="router.navigate(['/landing'], { fragment: 'pricing' })" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer">Contact</a>
                </nav>

                <ng-container *ngIf="authService.isAuthenticated(); else notAuthenticated">
                    <p-button icon="pi pi-user" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" severity="primary" raised rounded />
                </ng-container>
                <ng-template #notAuthenticated>
                    <div class="flex gap-2">
                        <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" [text]="true"></button>
                        <button pButton pRipple label="Register" routerLink="/auth/login" [rounded]="true"></button>
                    </div>
                </ng-template>
            </div>
        </header>
    `,
    styles: [
        `
            nav a {
                font-size: 20px;
            }
            nav a:hover {
                color: var(--primary-color);
            }
        `
    ]
})
export class TopbarWidget {
    scrolled = false;

    constructor(
        public router: Router,
        public authService: AuthenticationService
    ) {}

    @HostListener('window:scroll', [])
    onScroll(): void {
        this.scrolled = window.scrollY > 50;
    }
}
