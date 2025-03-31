import { Routes } from '@angular/router';
import { ProductsListComponent } from './products-list/products-list.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';

export const routes: Routes = [
    {
        path: '',
        component: ProductsListComponent
    },
    {
        path: ':id',
        component: ProductDetailComponent
    }
];
