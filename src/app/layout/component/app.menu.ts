import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `
        <ul class="layout-menu">
            <ng-container *ngFor="let item of model; let i = index">
                <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
                <li *ngIf="item.separator" class="menu-separator"></li>
            </ng-container>
        </ul>
    `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Shop',
                icon: 'pi pi-fw pi-shopping-cart',
                items: [
                    {
                        label: 'All Products',
                        icon: 'pi pi-fw pi-list',
                        routerLink: ['/store/products']
                    },
                    {
                        label: 'Categories',
                        icon: 'pi pi-fw pi-tags',
                        items: [
                            {
                                label: 'Electronics',
                                icon: 'pi pi-fw pi-mobile',
                                routerLink: ['/store/products/electronics'],
                                queryParams: { category: 'electronics' }
                            },
                            {
                                label: 'Clothing',
                                icon: 'pi pi-fw pi-tag',
                                routerLink: ['/store/products/accessories'],
                                queryParams: { category: 'clothing' }
                            },
                            {
                                label: 'Accessories',
                                icon: 'pi pi-fw pi-watch',
                                routerLink: ['/store/products/clothing'],
                                queryParams: { category: 'accessories' }
                            }
                        ]
                    },
                    {
                        label: 'On Sale',
                        icon: 'pi pi-fw pi-dollar',
                        routerLink: ['/store/products/onSale'],
                        queryParams: { onSale: 'true' }
                    }
                ]
            },
            {
                label: 'Filters',
                icon: 'pi pi-fw pi-filter',
                items: [
                    {
                        label: 'Price Range',
                        icon: 'pi pi-fw pi-money-bill',
                        items: [
                            {
                                label: 'Under $50',
                                routerLink: ['/store/products'],
                                queryParams: { priceMin: '0', priceMax: '50' }
                            },
                            {
                                label: '$50 - $100',
                                routerLink: ['/store/products'],
                                queryParams: { priceMin: '50', priceMax: '100' }
                            },
                            {
                                label: 'Over $100',
                                routerLink: ['/store/products'],
                                queryParams: { priceMin: '100' }
                            }
                        ]
                    },
                    {
                        label: 'Rating',
                        icon: 'pi pi-fw pi-star',
                        items: [
                            {
                                label: '4 Stars & Up',
                                routerLink: ['/store/products'],
                                queryParams: { rating: '4' }
                            },
                            {
                                label: '3 Stars & Up',
                                routerLink: ['/store/products'],
                                queryParams: { rating: '3' }
                            }
                        ]
                    }
                ]
            },
            {
                label: 'Account',
                icon: 'pi pi-fw pi-user',

                items: this.getAccountMenuItems()
            },
            {
                label: 'Help',
                icon: 'pi pi-fw pi-question-circle',
                items: [
                    {
                        label: 'FAQ',
                        icon: 'pi pi-fw pi-question',
                        routerLink: ['/help/faq']
                    },
                    {
                        label: 'Contact Us',
                        icon: 'pi pi-fw pi-envelope',
                        routerLink: ['/help/contact']
                    }
                ]
            }
        ];
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
