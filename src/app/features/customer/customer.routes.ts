import { Routes } from '@angular/router';
import { Landing } from '../landing/landing';
import { ShoppingCartComponent } from './shopping-cart/shopping-cart.component';
import { UserProfileComponent } from './user-profile/user-profile.component';

export default [
    { path: '', component: Landing },
    { path: 'cart', component: ShoppingCartComponent },
    { path: 'profile', component: UserProfileComponent }
    // { path: 'product/:id', component: ProductComponent },
    // { path: 'cart', component: CartComponent },
    // { path: 'checkout', component: CheckoutComponent }
] as Routes;
