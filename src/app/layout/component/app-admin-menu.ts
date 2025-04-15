// app-admin-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ButtonModule } from 'primeng/button';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-admin-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, ButtonModule],
    template: /*html*/ `
        <ul class="layout-menu">
            <li class="layout-menuitem-category">
                <span>Admin Dashboard</span>
            </li>

            <!-- Dashboard Link -->
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" routerLink="/store/admin/dashboard">
                    <i class="pi pi-home mr-2" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/dashboard' }"></i>
                    <span class="font-medium" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/dashboard' }">Dashboard</span>
                </a>
            </li>

            <!-- Product Management -->
            <li class="layout-menuitem-category">
                <span>Products</span>
            </li>
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" routerLink="/store/admin/products">
                    <i class="pi pi-shopping-cart mr-2" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/products' }"></i>
                    <span class="font-medium" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/products' }">Manage Products</span>
                </a>
            </li>
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" routerLink="/store/admin/categories">
                    <i class="pi pi-tags mr-2" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/categories' }"></i>
                    <span class="font-medium" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/categories' }">Categories</span>
                </a>
            </li>

            <!-- Order Management -->
            <li class="layout-menuitem-category">
                <span>Orders</span>
            </li>
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" routerLink="/store/admin/orders">
                    <i class="pi pi-shopping-bag mr-2" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/orders' }"></i>
                    <span class="font-medium" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/orders' }">All Orders</span>
                </a>
            </li>
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" routerLink="/store/admin/orders/pending">
                    <i class="pi pi-clock mr-2" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/orders/pending' }"></i>
                    <span class="font-medium" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/orders/pending' }">Pending Orders</span>
                </a>
            </li>

            <!-- Customer Management -->
            <li class="layout-menuitem-category">
                <span>Customers</span>
            </li>
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" routerLink="/store/admin/customers">
                    <i class="pi pi-users mr-2" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/customers' }"></i>
                    <span class="font-medium" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/customers' }">Customer List</span>
                </a>
            </li>

            <!-- System Settings -->
            <li class="layout-menuitem-category">
                <span>System</span>
            </li>
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" routerLink="/store/admin/settings">
                    <i class="pi pi-cog mr-2" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/settings' }"></i>
                    <span class="font-medium" [ngClass]="{ 'text-primary-500': activeMenu === '/store/admin/settings' }">Settings</span>
                </a>
            </li>
            <li class="mb-3">
                <a class="flex align-items-center cursor-pointer py-3 px-3 surface-hover border-round transition-colors transition-duration-150 w-full menu-button" (click)="logout()">
                    <i class="pi pi-sign-out mr-2"></i>
                    <span class="font-medium">Logout</span>
                </a>
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
export class AppAdminMenu implements OnInit {
    model: MenuItem[] = [];
    activeMenu: string = '';

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    ngOnInit() {
        // Initialize based on current URL
        this.activeMenu = this.router.url;

        // Update on navigation changes
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.activeMenu = this.router.url;
        });

        // Initialize other menu items if needed
        this.model = [];
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
}
