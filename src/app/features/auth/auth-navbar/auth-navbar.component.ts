import { Component } from '@angular/core';
import { StyleClassModule } from 'primeng/styleclass';
import { Router, RouterModule } from '@angular/router';
import { RippleModule } from 'primeng/ripple';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { AuthenticationService } from '../../../core/services/authentication.service';

@Component({
    selector: 'auth-navbar',
    standalone: true,
    imports: [RouterModule, StyleClassModule, ButtonModule, RippleModule, CommonModule],
    template: /*html*/ `
        <header class="fixed left-6 top-1/2 -translate-y-1/2 z-50">
            <div class="flex flex-col items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-lg p-4 space-y-6">
                <!-- Logo -->
                <a class="flex flex-col items-center cursor-pointer group" routerLink="/landing">
                    <img src="assets/general/apolo2.png" alt="logo" class="w-12 h-12 transition-transform group-hover:scale-110" />
                    <span class="font-medium text-xs mt-2 text-gray-600 dark:text-gray-300">Apollo Store</span>
                </a>

                <!-- Navigation Links -->
                <nav class="flex flex-col items-center space-y-6">
                    <a routerLink="/" class="nav-link group relative" [class.active]="router.url === '/'">
                        <i class="pi pi-home text-xl"></i>
                        <span class="nav-tooltip">Accueil</span>
                    </a>
                    <a routerLink="/store/products" class="nav-link group relative" [class.active]="router.url.includes('/store/products')">
                        <i class="pi pi-shopping-bag text-xl"></i>
                        <span class="nav-tooltip">Magasin</span>
                    </a>
                </nav>

                <!-- Auth Buttons -->
                <div class="flex flex-col gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <a routerLink="/auth/login" class="nav-link group relative" [class.active]="router.url.includes('/auth/login')">
                        <i class="pi pi-sign-in text-xl"></i>
                        <span class="nav-tooltip">Connexion</span>
                    </a>
                    <a routerLink="/auth/register" class="nav-link group relative" [class.active]="router.url.includes('/auth/register')">
                        <i class="pi pi-user-plus text-xl"></i>
                        <span class="nav-tooltip">Inscription</span>
                    </a>
                </div>
            </div>

            <!-- Mobile Menu Button -->
            <button (click)="toggleMobileMenu()" class="lg:hidden fixed top-4 right-4 bg-white/90 dark:bg-gray-800/90 p-2 rounded-lg shadow-lg backdrop-blur-lg">
                <i class="pi" [ngClass]="mobileMenuOpen ? 'pi-times' : 'pi-bars'"></i>
            </button>

            <!-- Mobile Menu -->
            <div *ngIf="mobileMenuOpen" class="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40" (click)="toggleMobileMenu()">
                <div class="absolute right-0 top-0 h-full w-64 bg-white dark:bg-gray-800 shadow-2xl p-6" (click)="$event.stopPropagation()">
                    <div class="flex flex-col space-y-6">
                        <div class="flex items-center justify-between">
                            <img src="assets/general/apolo2.png" alt="logo" class="w-8 h-8" />
                            <button (click)="toggleMobileMenu()" class="p-2">
                                <i class="pi pi-times"></i>
                            </button>
                        </div>
                        <nav class="flex flex-col space-y-4">
                            <a routerLink="/" class="mobile-nav-link" [class.active]="router.url === '/'"> <i class="pi pi-home mr-2"></i> Accueil </a>
                            <a routerLink="/store/products" class="mobile-nav-link" [class.active]="router.url.includes('/store/products')"> <i class="pi pi-shopping-bag mr-2"></i> Magasin </a>
                            <a routerLink="/auth/login" class="mobile-nav-link" [class.active]="router.url.includes('/auth/login')"> <i class="pi pi-sign-in mr-2"></i> Connexion </a>
                            <a routerLink="/auth/register" class="mobile-nav-link" [class.active]="router.url.includes('/auth/register')"> <i class="pi pi-user-plus mr-2"></i> Inscription </a>
                        </nav>
                    </div>
                </div>
            </div>
        </header>
    `,
    styles: [
        `
            .nav-link {
                @apply p-3 rounded-xl transition-all duration-200 text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/10;
            }

            .nav-link.active {
                @apply text-primary bg-primary/10;
            }

            .nav-tooltip {
                @apply invisible opacity-0 absolute left-full ml-2 px-3 py-1 bg-gray-800 dark:bg-gray-700 text-white text-xs rounded-lg 
                   whitespace-nowrap transition-all duration-200 transform translate-x-2 group-hover:visible group-hover:opacity-100 
                   group-hover:translate-x-0;
            }

            .mobile-nav-link {
                @apply flex items-center px-4 py-2 rounded-lg text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 
                   transition-colors duration-200;
            }

            .mobile-nav-link.active {
                @apply bg-primary/10 text-primary;
            }

            /* Animation for mobile menu */
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                }
                to {
                    transform: translateX(0);
                }
            }

            .mobile-menu > div {
                animation: slideIn 0.3s ease-out;
            }
        `
    ]
})
export class AuthNavbar {
    mobileMenuOpen = false;

    constructor(
        public router: Router,
        public authService: AuthenticationService
    ) {}

    toggleMobileMenu() {
        this.mobileMenuOpen = !this.mobileMenuOpen;
    }
}
