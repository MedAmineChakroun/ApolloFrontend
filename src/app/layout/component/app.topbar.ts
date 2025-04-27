import { Component, OnInit, OnDestroy } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { NotificationService } from '../../core/services/notifications.service';
import { Notification } from '../../models/notification';
import { Store } from '@ngrx/store';
import { selectUserCode, selectUserId } from '../../store/user/user.selectors';
import { SignalRService } from '../../core/services/signalr.service';
import { ToastrService } from 'ngx-toastr';
import { MenuModule } from 'primeng/menu';
import { ProductsService } from '../../core/services/products.service';

// Define the Famille interface
export interface Famille {
    famId: number;
    famCode: string;
    famIntitule: string;
}

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [MenuModule, RouterModule, CommonModule, StyleClassModule, ConfirmDialogModule, ButtonModule, BadgeModule, SidebarModule, OverlayPanelModule],
    providers: [ConfirmationService, CartService, NotificationService, ToastrService, ProductsService],
    styleUrls: ['./app.topbar.css'],
    templateUrl: './app.topbar.html'
})
export class AppTopbar implements OnInit, OnDestroy {
    items!: MenuItem[];
    loginMenuItems: MenuItem[] = [];
    isConnected = false;
    cartItems: CartItem[] = [];
    showCart = false;
    cartTotal: number = 0;
    private cartSubscription?: Subscription;
    private notificationSubscription?: Subscription;
    private unreadCountSubscription?: Subscription;
    private signalRSubscription?: Subscription;
    private userCodeSubscription?: Subscription;
    private categoriesSubscription?: Subscription;
    private connectionStarted = false;

    notifications: Notification[] = [];
    unreadNotifications: Notification[] = [];
    readNotifications: Notification[] = [];
    unreadNotificationsCount: number = 0;

    tiersCode: string = '';
    showCategoriesMenu = false;
    showMobileCategoriesMenu = false;
    categories: string[] = [];

    // For category filtering
    currentCategory: string = '';

    constructor(
        public layoutService: LayoutService,
        private authService: AuthenticationService,
        private router: Router,
        private route: ActivatedRoute,
        private confirmationService: ConfirmationService,
        private cartService: CartService,
        private notificationService: NotificationService,
        private store: Store,
        private signalRService: SignalRService,
        private toastr: ToastrService,
        private productService: ProductsService
    ) {}

    ngOnInit() {
        this.isConnected = this.authService.isAuthenticated();
        this.initLoginMenuItems();
        this.cartSubscription = this.cartService.getCartItems().subscribe((items) => {
            this.cartItems = items;
        });

        this.cartService.getCartItemCount().subscribe((total) => {
            this.cartTotal = total;
        });

        // Load categories
        this.loadCategories();

        // Get current category from URL if present
        const categoryParam = this.route.snapshot.queryParams['category'];
        if (categoryParam) {
            this.currentCategory = decodeURIComponent(categoryParam);
        }

        if (this.isConnected) {
            this.userCodeSubscription = this.store.select(selectUserCode).subscribe((userCode) => {
                if (userCode && !this.connectionStarted) {
                    this.tiersCode = userCode;
                    this.signalRService.startConnection(this.tiersCode);
                    this.connectionStarted = true;
                    this.subscribeToNotifications();
                }
            });

            this.loadNotifications();
        }
    }
    initLoginMenuItems() {
        this.loginMenuItems = [
            {
                label: 'Login',
                icon: 'pi pi-sign-in',
                command: () => {
                    this.navigateToLogin();
                }
            },
            {
                label: 'Register',
                icon: 'pi pi-user-plus',
                command: () => {
                    this.navigateToRegister();
                }
            }
        ];
    }
    ngOnDestroy() {
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }

        if (this.notificationSubscription) {
            this.notificationSubscription.unsubscribe();
        }

        if (this.unreadCountSubscription) {
            this.unreadCountSubscription.unsubscribe();
        }

        if (this.signalRSubscription) {
            this.signalRSubscription.unsubscribe();
        }

        if (this.userCodeSubscription) {
            this.userCodeSubscription.unsubscribe();
        }

        if (this.categoriesSubscription) {
            this.categoriesSubscription.unsubscribe();
        }

        if (this.connectionStarted) {
            this.signalRService.stopConnection();
        }
    }

    loadCategories() {
        this.productService.getUniqueFamilies().subscribe({
            next: (families) => {
                this.categories = families;
            },
            error: (err) => {
                console.error('Error loading product families:', err);
                this.categories = []; // Fallback empty array
            }
        });
    }

    navigateToCategory(category: string) {
        // Get current query parameters to preserve other filters (like inStock, priceMin, priceMax)
        const currentParams = { ...this.route.snapshot.queryParams };

        // Add or update the category parameter
        currentParams['category'] = category;
        this.currentCategory = category;

        this.router
            .navigate(['/store/products'], {
                queryParams: currentParams
            })
            .then(() => {
                // After navigation completes, scroll to grid (optional)
                this.scrollToProductGrid();
            });

        // Close menus after navigation
        this.showCategoriesMenu = false;
        this.showMobileCategoriesMenu = false;
    }

    private scrollToProductGrid() {
        setTimeout(() => {
            const gridElement = document.getElementById('grid');
            if (gridElement) {
                const yOffset = -80; // adjust this based on sticky header height
                const y = gridElement.getBoundingClientRect().top + window.scrollY + yOffset;
                window.scrollTo({ top: y, behavior: 'auto' });
            }
        }, 50);
    }

    loadNotifications() {
        if (this.isConnected) {
            this.notificationSubscription = this.store.select(selectUserCode).subscribe((userCode) => {
                this.tiersCode = userCode ?? '';

                // Now use this.tiersId in the getNotifications call
                this.notificationService.getNotifications(this.tiersCode).subscribe((notifications) => {
                    this.notifications = notifications;
                    this.updateNotificationLists();
                });
            });

            // Subscribe to unread count
            this.unreadCountSubscription = this.notificationService.getUnreadCount().subscribe((count) => {
                this.unreadNotificationsCount = count;
            });
        }
    }

    updateNotificationLists() {
        this.unreadNotifications = this.notifications.filter((notification) => !notification.isRead);
        this.readNotifications = this.notifications.filter((notification) => notification.isRead);
    }

    readNotification(notification: Notification) {
        if (!notification.isRead) {
            this.notificationService.markAsRead(notification.id).subscribe(() => {
                notification.isRead = true;
                this.updateNotificationLists();
            });
        }

        if (notification.type === 'commande') {
            this.router.navigate(['/store/customer/orders']);
        }
    }

    markAllAsRead() {
        // Since the backend doesn't support marking all as read,
        // we'll mark each unread notification individually
        const markPromises = this.unreadNotifications.map((notification) => this.readNotification(notification));

        // Wait for all notifications to be marked as read
        Promise.all(markPromises).then(() => {
            // Update all notifications to read
            this.notifications.forEach((notification) => (notification.isRead = true));
            this.updateNotificationLists();
        });
    }

    formatDate(dateInput: Date | string): string {
        const now = new Date();
        // Ensure we're working with a Date object
        const notificationDate = dateInput instanceof Date ? dateInput : new Date(dateInput);

        const diff = now.getTime() - notificationDate.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        if (days > 0) {
            return `${days} day${days > 1 ? 's' : ''} ago`;
        } else if (hours > 0) {
            return `${hours} hour${hours > 1 ? 's' : ''} ago`;
        } else if (minutes > 0) {
            return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
        } else {
            return 'maintenant';
        }
    }

    navigateToCart() {
        this.router.navigate(['/store/products/cart']);
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
    navigateToRegister() {
        this.router.navigate(['/auth/register']);
    }
    confirmLogout() {
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir vous déconnecter ?',
            header: 'Confirmation de déconnexion',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Oui',
            rejectLabel: 'Non',
            rejectButtonStyleClass: 'p-button-danger',
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

    navigateToOrders() {
        this.router.navigate(['/store/customer/orders']);
    }

    IsAdmin() {
        if (!this.authService.isAuthenticated()) return false;
        const role = this.authService.getUserRole();
        if (role === 'admin') {
            return true;
        }
        return false;
    }

    getIconClass(type: string | undefined): string {
        if (!type) return 'icon-default';

        switch (type.toLowerCase()) {
            case 'commande':
                return 'icon-order';
            case 'article':
                return 'icon-payment';
            case 'alert':
                return 'icon-alert';
            case 'error':
                return 'icon-error';
            default:
                return 'icon-default';
        }
    }

    getIconType(type: string | undefined): string {
        if (!type) return 'pi-bell';

        switch (type.toLowerCase()) {
            case 'commande':
                return 'pi-shopping-bag';
            case 'article':
                return 'pi-shopping-cart';
            case 'alert':
                return 'pi-exclamation-circle';
            case 'error':
                return 'pi-times-circle';
            default:
                return 'pi-bell';
        }
    }

    private subscribeToNotifications() {
        this.signalRSubscription = this.signalRService.notification$.subscribe((notif) => {
            if (notif) {
                this.notifications.unshift(notif);
                this.unreadNotificationsCount++;
                this.updateNotificationLists();

                // Add toast notification here
                this.toastr.success(notif.message, notif.title, {
                    timeOut: 3000,
                    positionClass: 'toast-bottom-right',
                    progressBar: true,
                    progressAnimation: 'increasing',
                    closeButton: true
                });
            }
        });
    }
    navigateToContact() {
        this.router.navigate(['/store/help/contact']);
    }
    navigateToList() {
        this.router.navigate(['/store/products']);
    }
    navigateToMeilleurVentes() {
        this.router.navigate(['/store/products']).then(() => {
            // After navigation completes, scroll to grid
            setTimeout(() => {
                const gridElement = document.getElementById('MeilleurVentes');
                if (gridElement) {
                    const yOffset = -80; // adjust this based on sticky header height, etc.
                    const y = gridElement.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' }); // instant scroll
                }
            }, 50);
        });
    }
    navigateToListPlusNotes() {
        this.router.navigate(['/store/products']).then(() => {
            // After navigation completes, scroll to grid
            setTimeout(() => {
                const gridElement = document.getElementById('PlusNotes');
                if (gridElement) {
                    const yOffset = -80; // adjust this based on sticky header height, etc.
                    const y = gridElement.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' }); // instant scroll
                }
            }, 50);
        });
    }
    navigateToListRecommendations() {
        this.router.navigate(['/store/products']).then(() => {
            // After navigation completes, scroll to grid
            setTimeout(() => {
                const gridElement = document.getElementById('Recommendations');
                if (gridElement) {
                    const yOffset = -80; // adjust this based on sticky header height, etc.
                    const y = gridElement.getBoundingClientRect().top + window.scrollY + yOffset;
                    window.scrollTo({ top: y, behavior: 'smooth' }); // instant scroll
                }
            }, 50);
        });
    }
}
