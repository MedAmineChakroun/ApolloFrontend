import { Routes } from '@angular/router';
import { products } from './products-list/products-list.component';
import { ShoppingCartComponent } from '../customer/shopping-cart/shopping-cart.component';

export default [
    { path: '', component: products }
    // { path: 'products', component: ProductsComponent },
    // { path: 'product/:id', component: ProductComponent },
    // { path: 'cart', component: CartComponent },
    // { path: 'checkout', component: CheckoutComponent }
] as Routes;
