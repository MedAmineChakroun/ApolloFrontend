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

                <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:!hidden" (click)="toggleMobileMenu()">
                    <i class="pi" [ngClass]="mobileMenuOpen ? 'pi-times' : 'pi-bars'" [style.fontSize.rem]="1.5"></i>
                </a>

                <nav class="hidden lg:flex space-x-8">
                    <a (click)="router.navigate(['/landing'], { fragment: 'home' })" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer ">Home</a>

                    <a (click)="router.navigate(['/store/products'])" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer">Store</a>

                    <a (click)="router.navigate(['/landing'], { fragment: 'highlights' })" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer">About Us</a>

                    <a (click)="router.navigate(['/landing'], { fragment: 'pricing' })" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" class="hover:text-gray-300 transition cursor-pointer">Contact</a>
                </nav>

                <ng-container *ngIf="authService.isAuthenticated(); else notAuthenticated">
                    <p-button (click)="navigateToProfile()" icon="pi pi-user" [ngClass]="{ 'text-white': !scrolled, 'text-black': scrolled }" severity="primary" raised rounded />
                </ng-container>
                <ng-template #notAuthenticated>
                    <div class="flex gap-2">
                        <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" [text]="true"></button>
                        <button pButton pRipple label="Register" routerLink="/auth/login" [rounded]="true"></button>
                    </div>
                </ng-template>
            </div>

            <!-- Mobile Menu -->
            <div *ngIf="mobileMenuOpen" class="lg:hidden mobile-menu">
                <div class="flex flex-col p-4 bg-white/95 shadow-lg backdrop-blur-md">
                    <a (click)="navigateMobile(['/landing'], { fragment: 'home' })" class="mobile-menu-item">Home</a>
                    <a (click)="navigateMobile(['/store/products'])" class="mobile-menu-item">Store</a>
                    <a (click)="navigateMobile(['/landing'], { fragment: 'highlights' })" class="mobile-menu-item">About Us</a>
                    <a (click)="navigateMobile(['/landing'], { fragment: 'pricing' })" class="mobile-menu-item">Contact</a>

                    <div class="flex flex-col mt-4 space-y-2" *ngIf="!authService.isAuthenticated()">
                        <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" class="w-full"></button>
                        <button pButton pRipple label="Register" routerLink="/auth/login" [rounded]="true" severity="secondary" class="w-full"></button>
                    </div>
                    <div class="mt-4" *ngIf="authService.isAuthenticated()">
                        <button pButton pRipple label="My Profile" (click)="navigateMobile(['/store/customer/profile'])" icon="pi pi-user" class="w-full"></button>
                    </div>
                </div>
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
            .mobile-menu {
                position: absolute;
                width: 100%;
                z-index: 100;
                top: 100%;
                left: 0;
                right: 0;
                animation: slideDown 0.3s ease-out;
            }
            .mobile-menu-item {
                padding: 12px 16px;
                font-size: 18px;
                color: var(--text-color);
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .mobile-menu-item:hover {
                background-color: rgba(0, 0, 0, 0.05);
                color: var(--primary-color);
            }
            @keyframes slideDown {
                from {
                    opacity: 0;
                    transform: translateY(-10px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
        `
    ]
})
export class TopbarWidget {
    scrolled = false;
    mobileMenuOpen = false;

    constructor(
        public router: Router,
        public authService: AuthenticationService
    ) {}

    @HostListener('window:scroll', [])
    onScroll(): void {
        this.scrolled = window.scrollY > 50;
    }

    navigateToProfile() {
        this.router.navigate(['/store/customer/profile']);
        this.mobileMenuOpen = false;
    }

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }

    navigateMobile(route: string[], extras?: any) {
        this.router.navigate(route, extras);
        this.mobileMenuOpen = false; // Close the mobile menu after navigation
    }
}
