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
        <header class="w-full bg-white shadow-md z-50 p-0 m-0">
            <div class="flex items-center justify-between px-6 py-4 lg:px-12">
                <a class="flex items-center cursor-pointer" routerLink="/landing">
                    <img src="assets/general/ApolloLogo.PNG" alt="logo" style="width: 45px" class="mr-4" />
                    <span class="font-medium text-2xl leading-normal whitespace-nowrap">Apollo Store</span>
                </a>

                <a pButton [text]="true" severity="secondary" [rounded]="true" pRipple class="lg:!hidden" (click)="toggleMobileMenu()">
                    <i class="pi" [ngClass]="mobileMenuOpen ? 'pi-times' : 'pi-bars'" [style.fontSize.rem]="1.5"></i>
                </a>

                <nav class="hidden lg:flex space-x-8">
                    <a routerLink="/landing" class="text-black hover:text-primary transition cursor-pointer text-lg">Home</a>
                    <a routerLink="/store/products" class="text-black hover:text-primary transition cursor-pointer text-lg">Store</a>
                    <a routerLink="/auth/login" class="text-black hover:text-primary transition cursor-pointer text-lg">Login</a>
                    <a routerLink="/auth/register" class="text-black hover:text-primary transition cursor-pointer text-lg">Register</a>
                </nav>

                <div class="hidden lg:flex gap-2">
                    <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" class="text-sm"></button>
                    <button pButton pRipple label="Register" routerLink="/auth/register" [rounded]="true" severity="secondary" class="text-sm"></button>
                </div>
            </div>

            <!-- Mobile Menu -->
            <div *ngIf="mobileMenuOpen" class="lg:hidden mobile-menu">
                <div class="flex flex-col p-4 bg-white shadow-lg">
                    <a routerLink="/landing" class="mobile-menu-item">Home</a>
                    <a routerLink="/store/products" class="mobile-menu-item">Store</a>
                    <a routerLink="/auth/login" class="mobile-menu-item">Login</a>
                    <a routerLink="/auth/register" class="mobile-menu-item">Register</a>

                    <div class="flex flex-col mt-4 space-y-2">
                        <button pButton pRipple label="Login" routerLink="/auth/login" [rounded]="true" class="w-full"></button>
                        <button pButton pRipple label="Register" routerLink="/auth/register" [rounded]="true" severity="secondary" class="w-full"></button>
                    </div>
                </div>
            </div>
        </header>
    `,
    styles: [
        `
            nav a {
                font-size: 18px;
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
