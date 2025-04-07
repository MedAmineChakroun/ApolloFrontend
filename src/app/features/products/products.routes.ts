import { Routes } from '@angular/router';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { products } from './products-list/products-list.component';

export default [
    { path: '', component: products },
    { path: ':id', component: ProductDetailsComponent }
] as Routes;
