import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';

@Injectable({
    providedIn: 'root'
})
export class RoleGuard implements CanActivate {
    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const userRole = this.authService.getUserRole(); // e.g., 'admin', 'seller', 'customer'
        const allowedRoles = route.data['roles'] as string[];

        if (allowedRoles.includes(userRole)) {
            return true;
        }
        this.router.navigate(['/landing']); // Redirect to landing if unauthorized
        return false;
    }
}
