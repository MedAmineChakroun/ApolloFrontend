import { Component } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { StyleClassModule } from 'primeng/styleclass';
import { AppConfigurator } from './app.configurator';
import { LayoutService } from '../service/layout.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { Store } from '@ngrx/store';
import { User } from '../../models/user';
import { selectUser } from '../../store/user/user.selectors';
import { Observable } from 'rxjs';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [RouterModule, CommonModule, StyleClassModule, AppConfigurator, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: /*html*/ ` <p-confirmDialog></p-confirmDialog>
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
                <div class="layout-config-menu">
                    <button type="button" class="layout-topbar-action" (click)="toggleDarkMode()">
                        <i [ngClass]="{ 'pi ': true, 'pi-moon': layoutService.isDarkTheme(), 'pi-sun': !layoutService.isDarkTheme() }"></i>
                    </button>
                    <div class="relative">
                        <button
                            class="layout-topbar-action layout-topbar-action-highlight"
                            pStyleClass="@next"
                            enterFromClass="hidden"
                            enterActiveClass="animate-scalein"
                            leaveToClass="hidden"
                            leaveActiveClass="animate-fadeout"
                            [hideOnOutsideClick]="true"
                        >
                            <i class="pi pi-palette"></i>
                        </button>
                        <app-configurator />
                    </div>
                </div>

                <button class="layout-topbar-menu-button layout-topbar-action" pStyleClass="@next" enterFromClass="hidden" enterActiveClass="animate-scalein" leaveToClass="hidden" leaveActiveClass="animate-fadeout" [hideOnOutsideClick]="true">
                    <i class="pi pi-ellipsis-v"></i>
                </button>

                <div *ngIf="isConnected" class="layout-topbar-menu hidden lg:block">
                    <div class="layout-topbar-menu-content">
                        <button type="button" class="layout-topbar-action">
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
        </div>`
})
export class AppTopbar {
    items!: MenuItem[];
    isConnected = false;

    constructor(
        public layoutService: LayoutService,
        private authService: AuthenticationService,
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

    ngOnInit() {
        this.isConnected = this.authService.isAuthenticated();
    }
    navigateToLogin() {
        this.router.navigate(['/auth/login']);
    }
    confirmLogout() {
        this.confirmationService.confirm({
            message: 'Are you sure you want to logout?',
            header: 'Logout Confirmation',
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
