import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { CartService } from '../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { CartItem } from '../../core/services/cart.service';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';
import { SidebarModule } from 'primeng/sidebar';
import { ShoppingCartComponent } from '../../features/customer/shopping-cart/shopping-cart.component';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, ConfirmDialogModule, ButtonModule, BadgeModule, SidebarModule, ShoppingCartComponent],
    providers: [ConfirmationService, CartService],
    styleUrls: ['./app.topbar.css'],
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
                    <div class="cart-icon" (click)="toggleCart()">
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
                    <button (click)="toggleCart()" type="button" class="layout-topbar-action">
                        <i class="pi pi-shopping-cart"></i>
                        <span>Cart</span>
                        <span *ngIf="cartItems.length > 0" class="mobile-cart-badge">{{ cartItems.length }}</span>
                    </button>

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

        <!-- Cart Sidebar -->
        <p-sidebar [(visible)]="showCart" position="right" [modal]="true" [baseZIndex]="10000" styleClass="p-sidebar-lg">
            <app-shopping-cart></app-shopping-cart>
        </p-sidebar>
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

    toggleCart() {
        this.showCart = !this.showCart;
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
