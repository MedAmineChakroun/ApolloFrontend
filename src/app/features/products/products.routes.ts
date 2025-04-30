import { Routes } from '@angular/router';
import { ProductDetailsComponent } from './product-details/product-details.component';
import { ProductsListComponent } from './products-list/products-list.component';
import { ShoppingCartComponent } from '../products/shopping-cart/shopping-cart.component';

export default [
    { path: '', component: ProductsListComponent },
    { path: 'cart', component: ShoppingCartComponent },
    { path: ':id', component: ProductDetailsComponent }
] as Routes;
