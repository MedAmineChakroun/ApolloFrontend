import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { MenuItem } from 'primeng/api';
import { AuthenticationService } from '../../core/services/authentication.service';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProductsService } from '../../core/services/products.service';
import { ScrollerModule } from 'primeng/scroller';
import { FamillesService } from '../../core/services/familles.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, RouterModule, FormsModule, SliderModule, InputTextModule, ButtonModule, ScrollerModule, CheckboxModule],
    template: /*html*/ `
        <div class="sidebar-container">
            <!-- Shop Section -->
            <div class="menu-category category-header">
                <span class="category-title">Shop</span>
            </div>

            <div class="menu-category menu-item-container">
                <a class="menu-item" (click)="navigateToAllProducts()" [ngClass]="{ 'active-item': isRouteActive('/store/products') && !hasQueryParams() }">
                    <i class="pi pi-list"></i>
                    <span>Liste Articles</span>
                </a>
            </div>

            <div class="menu-category menu-item-container">
                <div class="menu-item expandable" (click)="toggleCategoriesDropdown()">
                    <div class="item-content">
                        <i class="pi pi-tags"></i>
                        <span>Categories</span>
                    </div>
                    <i class="pi pi-chevron-right arrow" [ngClass]="{ 'arrow-expanded': showCategories }"></i>
                </div>
                <div class="submenu" *ngIf="showCategories">
                    <ul class="categories-list">
                        <li *ngFor="let famille of productFamilies" class="category-item">
                            <a class="submenu-item" (click)="navigateToCategory(famille)" [ngClass]="{ 'active-item': isRouteActive('/store/products') && isCategoryActive(famille) }">
                                <i class="pi pi-tag"></i>
                                <span>{{ famille }}</span>
                            </a>
                        </li>
                        <li *ngIf="productFamilies.length === 0" class="submenu-item loading">
                            <i class="pi pi-spin pi-spinner"></i>
                            <span>Loading...</span>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="menu-category menu-item-container" [ngClass]="{ 'active-item': isRouteActive('/store/products') && isInStockActive() }">
                <div class="menu-item in-stock">
                    <div class="item-content">
                        <i class="pi pi-check-circle"></i>
                        <span>In Stock</span>
                    </div>
                    <p-checkbox [binary]="true" [(ngModel)]="inStockOnly" (onChange)="navigateToOnSale()"></p-checkbox>
                </div>
            </div>

            <div class="menu-category menu-item-container">
                <div class="price-filter-container">
                    <div class="price-label mb-4 ml-2">
                        <i class="pi pi-money-bill"></i>
                        <span>Price range</span>
                    </div>
                    <div class="price-range-labels">
                        <span>Min: TND{{ priceRange[0] }}</span>
                        <span>Max: TND{{ priceRange[1] }}</span>
                    </div>
                    <p-slider [(ngModel)]="priceRange" [range]="true" [min]="0" [max]="5000" class="w-full"></p-slider>
                    <div class="apply-filter">
                        <button pButton label="Apply Filter" icon="pi pi-filter" (click)="applyPriceFilter()" class="p-button-sm"></button>
                    </div>
                </div>
            </div>

            <!-- Account Section -->
            <div class="menu-category category-header">
                <span class="category-title">My Account</span>
            </div>

            <ng-container *ngIf="authService.isAuthenticated(); else notAuthenticated">
                <div class="menu-category menu-item-container">
                    <a class="menu-item" [routerLink]="['/store/customer/profile']" [ngClass]="{ 'active-item': isRouteActive('/store/customer/profile') }">
                        <i class="pi pi-user"></i>
                        <span>Profile</span>
                    </a>
                </div>
                <div class="menu-category menu-item-container">
                    <a class="menu-item" [routerLink]="['/store/customer/orders']" [ngClass]="{ 'active-item': isRouteActive('/store/customer/orders') }">
                        <i class="pi pi-shopping-bag"></i>
                        <span>Commandes</span>
                    </a>
                </div>
                <div class="menu-category menu-item-container">
                    <a class="menu-item" (click)="logout()">
                        <i class="pi pi-sign-out"></i>
                        <span>Logout</span>
                    </a>
                </div>
            </ng-container>

            <ng-template #notAuthenticated>
                <div class="menu-category menu-item-container" [ngClass]="{ 'active-item': isRouteActive('/auth/login') }">
                    <a class="menu-item" [routerLink]="['/auth/login']">
                        <i class="pi pi-sign-in"></i>
                        <span>Login</span>
                    </a>
                </div>
                <div class="menu-category menu-item-container" [ngClass]="{ 'active-item': isRouteActive('/auth/register') }">
                    <a class="menu-item" [routerLink]="['/auth/register']">
                        <i class="pi pi-user-plus"></i>
                        <span>Register</span>
                    </a>
                </div>
            </ng-template>

            <!-- Help Section -->
            <div class="menu-category category-header">
                <span class="category-title">Help</span>
            </div>

            <div class="menu-category menu-item-container" [ngClass]="{ 'active-item': isRouteActive('/store/help/faqs') }">
                <a class="menu-item" [routerLink]="['/store/help/faqs']">
                    <i class="pi pi-question-circle"></i>
                    <span>FAQs</span>
                </a>
            </div>
            <div class="menu-category menu-item-container" [ngClass]="{ 'active-item': isRouteActive('/store/help/contact') }">
                <a class="menu-item" [routerLink]="['/store/help/contact']">
                    <i class="pi pi-envelope"></i>
                    <span>Contact</span>
                </a>
            </div>
        </div>
    `,
    styles: [
        `
            .sidebar-container {
                width: 100%;
                background-color: white;
                border-right: 1px solid var(--surface-200);
                padding: 0.5rem 0;
            }

            .category-header {
                padding: 1rem 1rem 0.5rem;
                margin-top: 0.75rem;
                margin-bottom: 0.5rem;
            }

            .category-title {
                font-weight: 600;
                color: #6200ea;
                font-size: 1.1rem;
            }

            .menu-category {
                width: 100%;
            }

            .menu-item-container {
                margin-bottom: 0.5rem;
            }

            .menu-item {
                display: flex;
                align-items: center;
                padding: 0.75rem 1rem;
                cursor: pointer;
                transition: all 0.2s;
                color: #333;
                text-decoration: none;
                border-radius: 4px;
                margin: 0 0.5rem;
            }

            .menu-item:hover {
                background-color: var(--surface-100);
            }

            .menu-item i {
                margin-right: 0.75rem;
                font-size: 1.1rem;
            }

            .expandable {
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .item-content {
                display: flex;
                align-items: center;
            }

            .arrow {
                transition: transform 0.3s;
            }

            .arrow-expanded {
                transform: rotate(90deg);
            }

            .submenu {
                padding: 0.25rem 0 0.25rem 1rem;
                background-color: var(--surface-50);
                margin-top: 0.25rem;
                border-radius: 4px;
                margin-left: 1rem;
                margin-right: 0.5rem;
            }

            .categories-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .category-item {
                padding: 0;
                margin: 0;
            }

            .submenu-item {
                display: flex;
                align-items: center;
                padding: 0.6rem 1rem;
                color: #444;
                text-decoration: none;
                cursor: pointer;
                border-radius: 4px;
                margin-bottom: 0.25rem;
            }

            .submenu-item:hover {
                background-color: var(--surface-100);
            }

            .submenu-item i {
                margin-right: 0.75rem;
                font-size: 1rem;
            }

            .active-item {
                background-color: var(--surface-100);
                border-left: 3px solid var(--primary-color);
                color: var(--primary-color) !important;
            }

            .in-stock {
                justify-content: space-between;
            }

            .price-filter-container {
                padding: 0.5rem 1rem;
            }

            .price-label {
                display: flex;
                align-items: center;
                margin-bottom: 0.5rem;
                font-weight: 500;
            }

            .price-label i {
                margin-right: 0.5rem;
            }

            .price-range-labels {
                display: flex;
                justify-content: space-between;
                font-size: 0.8rem;
                margin-bottom: 0.5rem;
            }

            .apply-filter {
                display: flex;
                justify-content: flex-end;
                margin-top: 0.75rem;
            }

            .loading {
                color: #888;
                font-style: italic;
            }
        `
    ]
})
export class AppMenu implements OnInit {
    activeMenu: string = '';
    priceRange: number[] = [0, 2500]; // Default price range values
    productFamilies: string[] = [];
    showCategories: boolean = false;
    inStockOnly: boolean = false;

    filters = {
        priceMin: 0,
        priceMax: 5000,
        category: ''
    };

    constructor(
        public authService: AuthenticationService,
        private router: Router,
        private productsService: ProductsService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        // Set initial active menu based on current route
        this.activeMenu = this.router.url;

        // Subscribe to router events to update active menu when navigation occurs
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.activeMenu = this.router.url;
        });

        // Fetch the product families from the service
        this.loadProductFamilies();

        // Get current category from URL if present
        const categoryParam = this.route.snapshot.queryParams['category'];
        if (categoryParam) {
            this.filters.category = decodeURIComponent(categoryParam);
            this.showCategories = true; // Auto-expand categories if one is selected
        }

        // Check if inStock filter is applied
        const inStockParam = this.route.snapshot.queryParams['inStock'];
        this.inStockOnly = inStockParam === 'true';

        // Get price range from URL if present
        const priceMinParam = this.route.snapshot.queryParams['priceMin'];
        const priceMaxParam = this.route.snapshot.queryParams['priceMax'];

        if (priceMinParam) {
            this.priceRange[0] = parseInt(priceMinParam);
        }

        if (priceMaxParam) {
            this.priceRange[1] = parseInt(priceMaxParam);
        }
    }

    /**
     * Check if a specific route is active
     */
    isRouteActive(route: string): boolean {
        return this.activeMenu.startsWith(route);
    }

    /**
     * Check if the category parameter matches the provided category
     */
    isCategoryActive(category: string): boolean {
        return this.filters.category === category;
    }

    /**
     * Check if the inStock filter is active
     */
    isInStockActive(): boolean {
        return this.inStockOnly;
    }

    /**
     * Check if there are any query parameters in the current URL
     */
    hasQueryParams(): boolean {
        return Object.keys(this.route.snapshot.queryParams).length > 0;
    }

    toggleCategoriesDropdown() {
        this.showCategories = !this.showCategories;
    }

    navigateToAllProducts() {
        // Get current query parameters
        const currentParams = { ...this.route.snapshot.queryParams };

        // Remove the category parameter but keep others
        delete currentParams['category'];
        this.filters.category = '';

        this.router.navigate(['/store/products'], {
            queryParams: currentParams
        });
    }

    navigateToOnSale() {
        // Get current query parameters to preserve other filters (like category)
        const currentParams = { ...this.route.snapshot.queryParams };

        // Add or update the inStock parameter
        if (this.inStockOnly) {
            currentParams['inStock'] = 'true';
        } else {
            delete currentParams['inStock'];
        }

        this.router.navigate(['/store/products'], {
            queryParams: currentParams
        });
    }

    navigateToCategory(category: string) {
        // Get current query parameters to preserve other filters (like inStock)
        const currentParams = { ...this.route.snapshot.queryParams };

        // Add or update the category parameter
        currentParams['category'] = category;
        this.filters.category = category;

        this.router.navigate(['/store/products'], {
            queryParams: currentParams
        });
    }

    loadProductFamilies() {
        this.productsService.getUniqueFamilies().subscribe({
            next: (families) => {
                this.productFamilies = families;
            },
            error: (err) => {
                console.error('Error loading product families:', err);
                this.productFamilies = []; // Fallback empty array
            }
        });
    }

    applyPriceFilter() {
        // Get current query parameters to preserve other filters
        const currentParams = { ...this.route.snapshot.queryParams };

        // Update price range filters
        this.filters.priceMin = this.priceRange[0];
        this.filters.priceMax = this.priceRange[1];

        // Update query parameters
        currentParams['priceMin'] = this.priceRange[0];
        currentParams['priceMax'] = this.priceRange[1];

        this.router.navigate(['/store/products'], {
            queryParams: currentParams
        });
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
