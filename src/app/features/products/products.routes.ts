import { Routes } from '@angular/router';
import { products } from './products-list/products-list.component';

export default [
    { path: '', component: products }
    // { path: 'products', component: ProductsComponent },
    // { path: 'product/:id', component: ProductComponent },
] as Routes;
