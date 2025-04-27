// app-sidebar.component.ts
import { Component, ElementRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppMenu } from './app.menu';
import { AppAdminMenu } from './app-admin-menu';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule, AppMenu, AppAdminMenu],
    template: `
        <div class="layout-sidebar">
            <app-admin-menu *ngIf="isAdmin"></app-admin-menu>
            <app-menu></app-menu>
        </div>
    `
})
export class AppSidebar implements OnInit {
    isAdmin: boolean = false;

    constructor(
        public el: ElementRef,
        private authService: AuthenticationService
    ) {}

    ngOnInit() {
        // Check user role
        this.checkUserRole();

        // Subscribe to authentication changes using the correct property
        this.authService.authStatus$.subscribe(() => {
            this.checkUserRole();
        });
    }

    private checkUserRole() {
        if (this.authService.isAuthenticated()) {
            // Get user roles from token
            const userRole = this.authService.getUserRole();
            this.isAdmin = userRole === 'admin';
        } else {
            this.isAdmin = false;
        }
    }
}
