import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout'; // Import Layout
import { Landing } from './app/features/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { AuthGuard } from './app/core/guards/auth.guard';
import { RoleGuard } from './app/core/guards/role.guard';

export const appRoutes: Routes = [
    { path: 'landing', component: Landing },
    { path: 'auth', loadChildren: () => import('./app/features/auth/auth.routes') },

    // Layout Wrapper for Admin, Business, and Customer
    {
        path: '',
        component: AppLayout, // Layout applied to all child routes
        //test role for layout page
        // canActivate: [AuthGuard, RoleGuard],
        //data: { roles: ['customer'] },
        children: [
            {
                path: 'admin',
                loadChildren: () => import('./app/features/admin/admin.routes'),
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['admin'] }
            },
            {
                path: 'business',
                loadChildren: () => import('./app/features/business/business.routes'),
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['business'] }
            },
            {
                path: 'customer',
                loadChildren: () => import('./app/features/customer/customer.routes'),
                canActivate: [AuthGuard, RoleGuard],
                data: { roles: ['customer'] }
            }
        ]
    },

    { path: 'notfound', component: Notfound },
    { path: '**', redirectTo: '/landing' }
];
