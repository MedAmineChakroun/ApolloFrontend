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
        <header class="fixed top-0 left-0 w-full bg-transparent backdrop-blur-md z-50 p-0 m-0">
            <div class="flex items-center justify-between px-4 py-2 lg:px-8 max-w-7xl mx-auto">
                <a class="flex items-center cursor-pointer" routerLink="/landing">
                    <img src="assets/general/ApolloLogo.PNG" alt="logo" style="width: 35px" class="mr-3" />
                    <span class="font-medium text-xl leading-normal whitespace-nowrap">Authentication Section</span>
                </a>

                <div class="flex items-center gap-4">
                    <nav class="hidden lg:flex space-x-6">
                        <a routerLink="/" class="text-black hover:text-primary transition cursor-pointer text-sm font-medium">Home</a>
                        <a routerLink="/store/products" class="text-black hover:text-primary transition cursor-pointer text-sm font-medium">Store</a>
                    </nav>

                    <div class="hidden lg:flex gap-2">
                        <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" class="text-xs py-1 px-3" [outlined]="router.url.includes('/auth/login')"></button>
                        <button pButton pRipple label="Register" routerLink="/auth/register" [rounded]="true" [outlined]="router.url.includes('/auth/register')" severity="secondary" class="text-xs py-1 px-3"></button>
                    </div>

                    <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:!hidden" (click)="toggleMobileMenu()">
                        <i class="pi" [ngClass]="mobileMenuOpen ? 'pi-times' : 'pi-bars'" [style.fontSize.rem]="1.2"></i>
                    </a>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div *ngIf="mobileMenuOpen" class="lg:hidden mobile-menu">
                <div class="flex flex-col p-4 bg-transparent shadow-lg">
                    <a routerLink="/landing" class="mobile-menu-item">Home</a>
                    <a routerLink="/store/products" class="mobile-menu-item">Store</a>
                    <a routerLink="/auth/login" class="mobile-menu-item" [ngClass]="{ 'active-link': router.url.includes('/auth/login') }">Login</a>
                    <a routerLink="/auth/register" class="mobile-menu-item" [ngClass]="{ 'active-link': router.url.includes('/auth/register') }">Register</a>
                </div>
            </div>
        </header>
    `,
    styles: [
        `
            nav a {
                font-size: 16px;
                position: relative;
            }
            nav a:hover {
                color: var(--primary-color);
            }
            nav a:after {
                content: '';
                position: absolute;
                width: 0;
                height: 2px;
                bottom: -4px;
                left: 0;
                background-color: var(--primary-color);
                transition: width 0.3s ease;
            }
            nav a:hover:after {
                width: 100%;
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
                padding: 10px 16px;
                font-size: 16px;
                color: var(--text-color);
                border-bottom: 1px solid #f0f0f0;
                cursor: pointer;
                transition: all 0.2s ease;
            }
            .mobile-menu-item:hover {
                background-color: rgba(0, 0, 0, 0.05);
                color: var(--primary-color);
            }
            .active-link {
                color: var(--primary-color);
                font-weight: 500;
                background-color: rgba(var(--primary-color-rgb), 0.1);
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
