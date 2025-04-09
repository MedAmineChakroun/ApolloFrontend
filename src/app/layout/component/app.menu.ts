import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthenticationService } from '../../core/services/authentication.service';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ProductsService } from '../../core/services/products.service';
import { ScrollerModule } from 'primeng/scroller';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, FormsModule, SliderModule, InputTextModule, ButtonModule, ScrollerModule],
    template: /*html*/ `
        <ul class="layout-menu">
            <li class="layout-menuitem-category">
                <span>Menu</span>
            </li>
            <!-- Primary Navigation - All Products link -->
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" (click)="navigateToAllProducts()">
                    <i class="pi pi-shopping-cart mr-2 text-primary-400"></i>
                    <span class="font-medium">All Products</span>
                </a>
            </li>

            <!-- Categories Section with Scrollbar -->
            <li class="layout-menuitem-category">
                <span>Categories</span>
            </li>
            <li class="px-3 py-2">
                <div class="categories-container" style="max-height: 200px; overflow-y: auto; margin-bottom: 10px;">
                    <ul class="categories-list p-0 m-0">
                        <li *ngFor="let famille of productFamilies" class="category-item py-1">
                            <a class="category-link flex align-items-center cursor-pointer" (click)="navigateToCategory(famille)" [class.active-category]="filters.category === famille">
                                <i class="pi pi-tag mr-2" [class.text-primary]="filters.category === famille"></i>
                                <span>{{ famille }}</span>
                            </a>
                        </li>
                        <li *ngIf="productFamilies.length === 0" class="py-2 text-surface-500">
                            <i class="pi pi-spin pi-spinner mr-2"></i>
                            <span>Loading categories...</span>
                        </li>
                    </ul>
                </div>
            </li>

            <!-- Special Filters -->
            <li class="layout-menuitem-category mt-3">
                <span>Special Filters</span>
            </li>
            <li>
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" (click)="navigateToOnSale()">
                    <i class="pi pi-check-circle mr-2 "></i>
                    <span class="font-medium">In Stock Only</span>
                </a>
            </li>

            <!-- Price Filter Section -->
            <li class="layout-menuitem-category mt-3">
                <span>Price Range</span>
            </li>
            <li class="px-3 py-2">
                <div class="flex flex-column gap-2">
                    <div class="flex align-items-center justify-content-between">
                        <span class="text-sm">Min: {{ priceRange[0] | currency: 'TND' : 'symbol' : '1.0-0' }}</span>
                        <span class="text-sm">Max: {{ priceRange[1] | currency: 'TND' : 'symbol' : '1.0-0' }}</span>
                    </div>
                    <p-slider [(ngModel)]="priceRange" [range]="true" [min]="0" [max]="5000" class="w-full"></p-slider>
                    <div class="flex justify-content-end mt-2">
                        <button pButton label="Apply Filter" icon="pi pi-filter" (click)="applyPriceFilter()" size="small" class="p-button-sm"></button>
                    </div>
                </div>
            </li>

            <!-- Traditional Menu Items -->
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `,
    styles: [
        `
            .layout-menuitem-category {
                font-weight: 600;
                padding: 0.75rem 1rem;
                color: var(--surface-900);
                background-color: var(--surface-50);
                border-radius: 4px;
                margin: 0.5rem 0;
            }

            .categories-container {
                scrollbar-width: thin;
                scrollbar-color: var(--surface-400) var(--surface-100);
                border: 1px solid var(--surface-200);
                border-radius: 4px;
                padding: 0.5rem 0;
            }

            .categories-container::-webkit-scrollbar {
                width: 6px;
            }

            .categories-container::-webkit-scrollbar-track {
                background: var(--surface-100);
                border-radius: 4px;
            }

            .categories-container::-webkit-scrollbar-thumb {
                background-color: var(--surface-400);
                border-radius: 4px;
            }

            .category-item {
                list-style-type: none;
                transition: background-color 0.2s;
                border-radius: 4px;
                margin: 2px 0;
            }

            .category-item:hover {
                background-color: var(--surface-100);
            }

            .category-link {
                color: var(--text-color);
                font-size: 0.875rem;
                text-decoration: none;
                width: 100%;
                padding: 0.5rem;
                border-radius: 4px;
            }

            .active-category {
                font-weight: 600;
                background-color: var(--surface-200);
                color: var(--primary-color);
            }

            .menu-button {
                border: 1px solid var(--surface-200);
            }

            .menu-button:hover {
                background-color: var(--surface-100);
                border-color: var(--surface-300);
            }
        `
    ]
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];
    priceRange: number[] = [0, 2500]; // Default price range values
    productFamilies: string[] = [];
    filters = {
        priceMin: 0,
        priceMax: 5000,
        category: ''
    };

    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private productsService: ProductsService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        // Fetch the product families from the service
        this.loadProductFamilies();

        // Initialize other menu items
        this.model = [
            {
                label: 'Account',
                icon: 'pi pi-fw pi-angle-right',
                items: this.getAccountMenuItems()
            },
            {
                label: 'Help',
                icon: 'pi pi-fw pi-question-circle',
                items: [
                    {
                        label: 'FAQ',
                        icon: 'pi pi-fw pi-question',
                        routerLink: ['/store/help/faqs']
                    },
                    {
                        label: 'Contact Us',
                        icon: 'pi pi-fw pi-envelope',
                        routerLink: ['/store/help/contact']
                    }
                ]
            }
        ];

        // Get current category from URL if present
        const url = this.router.url;
        const categoryParam = url.includes('category=') ? url.split('category=')[1].split('&')[0] : '';
        if (categoryParam) {
            this.filters.category = decodeURIComponent(categoryParam);
        }
    }

    /**
     * Navigate to all products (clear category filter but preserve others)
     */
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

    /**
     * Navigate to In Stock products (preserve existing filters)
     */
    navigateToOnSale() {
        // Get current query parameters to preserve other filters (like category)
        const currentParams = { ...this.route.snapshot.queryParams };

        // Add or update the inStock parameter
        currentParams['inStock'] = 'true';

        this.router.navigate(['/store/products'], {
            queryParams: currentParams
        });
    }

    /**
     * Navigate to products filtered by category (preserve other filters)
     */
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

    /**
     * Load product families/categories from the API
     */
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

    /**
     * Apply the price filter and navigate to products page with query params
     * (preserves other active filters)
     */
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

    /**
     * Dynamically generates account menu items based on authentication status.
     */
    getAccountMenuItems(): MenuItem[] {
        if (this.authService.isAuthenticated()) {
            return [
                {
                    label: 'Profile',
                    icon: 'pi pi-fw pi-user-edit',
                    routerLink: ['/store/customer/profile']
                },
                {
                    label: 'Orders',
                    icon: 'pi pi-fw pi-shopping-bag',
                    routerLink: ['/account/orders']
                },
                {
                    label: 'Wishlist',
                    icon: 'pi pi-fw pi-heart',
                    routerLink: ['/account/wishlist']
                },
                {
                    label: 'Logout',
                    icon: 'pi pi-fw pi-sign-out',
                    command: () => this.logout()
                }
            ];
        } else {
            return [
                {
                    label: 'Login',
                    icon: 'pi pi-fw pi-sign-in',
                    routerLink: ['/auth/login']
                },
                {
                    label: 'Register',
                    icon: 'pi pi-fw pi-user-plus',
                    routerLink: ['/auth/register']
                }
            ];
        }
    }

    /**
     * Logs out the user and redirects to the login page.
     */
    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
