import { Routes } from '@angular/router';

export const appRoutes: Routes = [
    {
        path: 'products',
        loadChildren: () => import('./features/products/products.routes').then(m => m.routes)
    },
    {
        path: '',
        redirectTo: 'products',
        pathMatch: 'full'
    }
]; 