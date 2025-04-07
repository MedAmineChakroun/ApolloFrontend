import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CartService } from '../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { SidebarModule } from 'primeng/sidebar';
import { CartItem } from '../../models/cart-item';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, ConfirmDialogModule, ButtonModule, BadgeModule, SidebarModule],
    providers: [ConfirmationService, CartService],
    styles: [
        `
            :host ::ng-deep .p-sidebar {
                width: 35rem;
                background: var(--surface-overlay);
                box-shadow:
                    0 4px 6px -1px rgba(0, 0, 0, 0.1),
                    0 2px 4px -1px rgba(0, 0, 0, 0.06);
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            }

            :host ::ng-deep .p-sidebar-header {
                padding: 1.5rem;
                border-bottom: 1px solid var(--surface-border);
                background: var(--surface-section);
                border-top-left-radius: var(--content-border-radius);
                border-top-right-radius: var(--content-border-radius);
            }

            :host ::ng-deep .p-sidebar-content {
                padding: 0;
                height: calc(100vh - 4rem);
                overflow-y: auto;

                &::-webkit-scrollbar {
                    width: 8px;
                }

                &::-webkit-scrollbar-track {
                    background: var(--surface-section);
                    border-radius: 4px;
                }

                &::-webkit-scrollbar-thumb {
                    background: var(--surface-border);
                    border-radius: 4px;

                    &:hover {
                        background: var(--surface-hover);
                    }
                }
            }

            :host ::ng-deep .p-sidebar-footer {
                padding: 1rem 1.5rem;
                border-top: 1px solid var(--surface-border);
                background: var(--surface-section);
                border-bottom-left-radius: var(--content-border-radius);
                border-bottom-right-radius: var(--content-border-radius);
            }

            .cart-icon {
                position: relative;
                cursor: pointer;
                padding: 8px;
                transition: transform 0.3s ease;

                &:hover {
                    transform: scale(1.1);
                }

                i {
                    font-size: 1.5rem;
                    color: var(--text-color);
                }
            }

            .cart-badge {
                position: absolute;
                top: -5px;
                right: -5px;
                background: var(--primary-color);
                color: var(--primary-contrast-color);
                border-radius: 50%;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                font-weight: 600;
                min-width: 1.5rem;
                height: 1.5rem;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;

                &:hover {
                    transform: scale(1.1);
                }
            }

            .mobile-cart-badge {
                background: var(--primary-color);
                color: var(--primary-contrast-color);
                border-radius: 1rem;
                padding: 0.25rem 0.5rem;
                font-size: 0.75rem;
                font-weight: 600;
                margin-left: 0.5rem;
            }

            @media screen and (max-width: 991px) {
                .layout-topbar-menu {
                    position: absolute;
                    top: 100%;
                    right: 0;
                    background: var(--surface-overlay);
                    border: 1px solid var(--surface-border);
                    border-radius: var(--border-radius);
                    padding: 0.5rem;
                    min-width: 200px;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                    z-index: 1000;
                }

                .layout-topbar-menu button.layout-topbar-action {
                    width: 100%;
                    justify-content: flex-start;
                    padding: 0.75rem 1rem;

                    &:hover {
                        background: var(--surface-hover);
                    }
                }
            }
        `
    ],
    template: /*html*/ `
        <p-confirmDialog></p-confirmDialog>
        <div class="layout-topbar">
            <div class="layout-topbar-logo-container">
                <button class="layout-menu-button layout-topbar-action" (click)="layoutService.onMenuToggle()">
                    <i class="pi pi-bars"></i>
                </button>
                <a class="layout-topbar-logo" routerLink="/">
                    <img style="width: 3rem" src="assets/general/ApolloLogo.PNG" alt="Logo" />
                    <span>Apollo Store</span>
                </a>
            </div>

            <div class="layout-topbar-actions">
                <!-- Desktop View -->
                <div class="hidden lg:flex">
                    <!-- Cart Icon with Badge for Desktop -->
                    <div class="cart-icon" (click)="navigateToCart()">
                        <i class="pi pi-shopping-cart"></i>
                        <span *ngIf="cartItems.length > 0" class="cart-badge">{{ cartItems.length }}</span>
                    </div>
                </div>

                <!-- Mobile Menu Button -->
                <button
                    class="layout-topbar-menu-button layout-topbar-action lg:hidden"
                    pStyleClass="@next"
                    enterFromClass="hidden"
                    enterActiveClass="animate-scalein"
                    leaveToClass="hidden"
                    leaveActiveClass="animate-fadeout"
                    [hideOnOutsideClick]="true"
                >
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <!-- Mobile Menu -->
                <div class="layout-topbar-menu hidden lg:hidden">
                    <!-- Cart Icon for Mobile -->
                    <div class="cart-icon" (click)="navigateToCart()" type="button" class="layout-topbar-action">
                        <i class="pi pi-shopping-cart"></i>
                        <span *ngIf="cartItems.length > 0" class="cart-badge">{{ cartItems.length }}</span>
                        <span>Cart</span>
                    </div>

                    <!-- Authenticated User Menu Items -->
                    <div *ngIf="isConnected">
                        <button (click)="navigateToProfile()" type="button" class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                        <button (click)="confirmLogout()" type="button" class="layout-topbar-action">
                            <i class="pi pi-sign-out"></i>
                            <span>Exit</span>
                        </button>
                    </div>

                    <!-- Non-Authenticated User Menu Items -->
                    <div *ngIf="!isConnected">
                        <button (click)="navigateToLogin()" type="button" class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>Login</span>
                        </button>
                    </div>
                </div>

                <!-- Desktop Menu -->
                <div *ngIf="isConnected" class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button (click)="navigateToProfile()" type="button" class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>Profile</span>
                        </button>
                        <button (click)="confirmLogout()" type="button" class="layout-topbar-action">
                            <i class="pi pi-sign-out"></i>
                            <span>Exit</span>
                        </button>
                    </div>
                </div>
                <div *ngIf="!isConnected" class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button (click)="navigateToLogin()" type="button" class="layout-topbar-action">
                            <i class="pi pi-user"></i>
                            <span>Login</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    isConnected = false;
    cartItems: CartItem[] = [];
    showCart = false;
    private cartSubscription?: Subscription;
    constructor(
        public layoutService: LayoutService,
        private authService: AuthenticationService,
        private router: Router,
        private confirmationService: ConfirmationService,
        private cartService: CartService
    ) {}

    ngOnInit() {
        this.isConnected = this.authService.isAuthenticated();
        this.cartSubscription = this.cartService.getCartItems().subscribe((items) => {
            this.cartItems = items;
        });
    }

    ngOnDestroy() {
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }
    }

    navigateToCart() {
        this.router.navigate(['/store/customer/cart']);
    }

    removeFromCart(index: number) {
        this.cartService.removeFromCart(index);
    }

    clearCart() {
        this.cartService.clearCart();
        this.showCart = false;
    }

    navigateToProfile() {
        this.router.navigate(['/store/customer/profile']);
    }

    navigateToLogin() {
        this.router.navigate(['/auth/login']);
    }

    confirmLogout() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
            header: 'Confirmation de déconnexion',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.logout();
            }
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }

    toggleDarkMode() {
        this.layoutService.layoutConfig.update((state) => ({ ...state, darkTheme: !state.darkTheme }));
    }
}
