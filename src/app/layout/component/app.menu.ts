import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { AuthenticationService } from '../../core/services/authentication.service';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu {
    model: MenuItem[] = [];
    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    ngOnInit() {
        this.model = [
            {
                label: 'Home',
                items: [{ label: 'Overview', icon: 'pi pi-fw pi-th-large', routerLink: ['/'] }]
            },
            {
                label: 'Menu',
                icon: 'pi pi-fw pi-briefcase',
                routerLink: ['/pages'],
                items: [
                    {
                        label: 'Auth',
                        icon: 'pi pi-fw pi-user',
                        items: [
                            {
                                label: 'Login',
                                icon: 'pi pi-fw pi-sign-in',
                                routerLink: ['/auth/login']
                            },
                            {
                                label: 'Register',
                                icon: 'pi pi-fw pi-user-plus',
                                routerLink: ['/auth/register']
                            },
                            {
                                label: 'Error',
                                icon: 'pi pi-fw pi-times-circle',
                                routerLink: ['/auth/error']
                            },
                            {
                                label: 'Access Denied',
                                icon: 'pi pi-fw pi-lock',
                                routerLink: ['/auth/access']
                            }
                        ]
                    }
                ]
            }
        ];
        if (this.authService.isAuthenticated()) {
            this.model.push({
                label: 'Logout',
                items: [
                    {
                        label: 'Logout',
                        icon: 'pi pi-fw pi-sign-out',
                        routerLink: ['auth/login'],

                        command: () => this.logout()
                    }
                ]
            });
        }
    }
    logout() {
        this.authService.logout();
    }
}
