// app-admin-menu.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AuthenticationService } from '../../core/services/authentication.service';
import { ButtonModule } from 'primeng/button';
import { PanelMenuModule } from 'primeng/panelmenu';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-admin-menu',
    standalone: true,
    imports: [CommonModule, RouterModule, ButtonModule, PanelMenuModule],
    template: /*html*/ `
        <div class="admin-sidebar ">
            <div class="menu-category category-header mt-4">
                <span class="category-title">Acceuil</span>
            </div>
            <!-- Accueil -->
            <div class="menu-category">
                <a routerLink="/store/admin/dashboard" class="menu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/dashboard' }">
                    <i class="pi pi-home"></i>
                    <span>Dashboard</span>
                </a>
            </div>

            <!-- Traitements -->
            <div class="menu-category category-header">
                <span class="category-title">Traitements</span>
            </div>

            <!-- Liste de commandes (expandable) -->
            <div class="menu-category menu-item-container">
                <div class="menu-item expandable" (click)="toggleSubmenu('orders')">
                    <div class="item-content">
                        <i class="pi pi-shopping-bag"></i>
                        <span>Gestion commandes</span>
                    </div>
                    <i class="pi pi-chevron-right arrow" [ngClass]="{ 'arrow-expanded': expandedMenus['orders'] }"></i>
                </div>
                <div class="submenu" *ngIf="expandedMenus['orders']">
                    <a routerLink="/store/admin/orders" class="submenu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/orders' }">
                        <i class="pi pi-list"></i>
                        <span>Liste de commandes</span>
                    </a>

                    <a routerLink="/store/admin/orders/sync" class="submenu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/orders/sync' }">
                        <i class="pi pi-check-circle"></i>
                        <span>Liste synchronisé</span>
                    </a>
                </div>
            </div>

            <!-- Donnes de base -->
            <div class="menu-category category-header">
                <span class="category-title">Donnes de base</span>
            </div>

            <!-- Gestion Clients (expandable) -->
            <div class="menu-category menu-item-container">
                <div class="menu-item expandable" (click)="toggleSubmenu('clients')">
                    <div class="item-content">
                        <i class="pi pi-users"></i>
                        <span>Gestion Clients</span>
                    </div>
                    <i class="pi pi-chevron-right arrow" [ngClass]="{ 'arrow-expanded': expandedMenus['clients'] }"></i>
                </div>
                <div class="submenu" *ngIf="expandedMenus['clients']">
                    <a routerLink="/store/admin/clients" class="submenu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/clients' }">
                        <i class="pi pi-list"></i>
                        <span>Liste clients</span>
                    </a>
                    <a routerLink="/store/admin/clients/sync" class="submenu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/clients/sync' }">
                        <i class="pi pi-check-circle mr-2"></i>
                        <span>Liste synchronisé</span>
                    </a>
                </div>
            </div>

            <!-- Gestion Articles (expandable) -->
            <div class="menu-category menu-item-container">
                <div class="menu-item expandable" (click)="toggleSubmenu('products')">
                    <div class="item-content">
                        <i class="pi pi-box"></i>
                        <span>Gestion Articles</span>
                    </div>
                    <i class="pi pi-chevron-right arrow" [ngClass]="{ 'arrow-expanded': expandedMenus['products'] }"></i>
                </div>
                <div class="submenu" *ngIf="expandedMenus['products']">
                    <a routerLink="/store/admin/products" class="submenu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/products' }">
                        <i class="pi pi-list"></i>
                        <span>Liste articles</span>
                    </a>
                    <a routerLink="/store/admin/products/add" class="submenu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/products/add' }">
                        <i class="pi pi-plus"></i>
                        <span>Ajouter</span>
                    </a>
                    <a routerLink="/store/admin/products/sync" class="submenu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/products/sync' }">
                        <i class="pi pi-check-circle mr-2"></i>
                        <span>Liste synchronisé</span>
                    </a>
                </div>
            </div>

            <!-- Synchronisation -->
            <div class="menu-category category-header">
                <span class="category-title">Synchronisation</span>
            </div>

            <!-- Sync Commandes -->
            <div class="menu-category menu-item-container">
                <a routerLink="/store/admin/synchronize/commandes" class="menu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/synchronize/commandes' }">
                    <i class="pi pi-sync"></i>
                    <span>Sync Commandes</span>
                </a>
            </div>

            <!-- Sync Articles -->
            <div class="menu-category menu-item-container">
                <a routerLink="/store/admin/synchronize/products" class="menu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/synchronize/products' }">
                    <i class="pi pi-sync"></i>
                    <span>Sync Articles</span>
                </a>
            </div>

            <!-- Sync Clients -->
            <div class="menu-category menu-item-container">
                <a routerLink="/store/admin/synchronize/clients" class="menu-item" [ngClass]="{ 'active-item': activeMenu === '/store/admin/synchronize/clients' }">
                    <i class="pi pi-sync"></i>
                    <span>Sync Clients</span>
                </a>
            </div>

            <!-- Autres -->
            <div class="menu-category category-header">
                <span class="category-title">Autres</span>
            </div>

            <div class="menu-category menu-item-container">
                <a
                    href="http://localhost:3000/d/aspnetcore-metrics/asp-net-core-application-performance?orgId=1&from=now-30m&to=now&var-DS_PROMETHEUS=dekm8rqjnql1cd&var-server=DESKTOP-QD57IO2&var-app=ApolloBackend&var-env=development&refresh=5s"
                    class="menu-item"
                    target="_blank"
                >
                    <i class="pi pi-spin pi-cog"></i>
                    <span>Monitoring</span>
                </a>
            </div>
            <!-- Logout -->
            <div class="menu-category menu-item-container">
                <a (click)="logout()" class="menu-item">
                    <i class="pi pi-sign-out"></i>
                    <span>Logout</span>
                </a>
            </div>
        </div>
    `,
    styles: [
        `
            .admin-sidebar {
                width: 100%;
                background-color: white;
                border-right: 1px solid var(--surface-200);
                padding: 0.5rem 0;
            }

            .category-header {
                padding: 1rem 1rem 0.5rem;
                margin-bottom: 0.25rem;
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
                color: var(--primary-color);
            }
        `
    ]
})
export class AppAdminMenu implements OnInit {
    activeMenu: string = '';
    expandedMenus: { [key: string]: boolean } = {
        orders: false,
        clients: false,
        products: false
    };

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    ngOnInit() {
        // Initialize based on current URL
        this.activeMenu = this.router.url;

        // Set initial expanded state based on current route
        Object.keys(this.expandedMenus).forEach((key) => {
            this.expandedMenus[key] = this.activeMenu.includes(`/store/admin/${key}`);
        });

        // Update on navigation changes
        this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
            this.activeMenu = this.router.url;
        });
    }

    toggleSubmenu(key: string) {
        this.expandedMenus[key] = !this.expandedMenus[key];
    }

    logout() {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
    }
    naviagteToMonitoring() {}
}
