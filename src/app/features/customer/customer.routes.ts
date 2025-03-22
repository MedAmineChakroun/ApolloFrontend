import { Routes } from '@angular/router';
import { Landing } from '../landing/landing';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';

export default [
    { path: '', component: Landing },
    { path: '/cart', component: ShoppingCartComponent }
    // { path: 'product/:id', component: ProductComponent },
    // { path: 'cart', component: CartComponent },
    // { path: 'checkout', component: CheckoutComponent }
] as Routes;
