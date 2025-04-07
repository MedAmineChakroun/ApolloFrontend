import { Routes } from '@angular/router';
import { Landing } from '../landing/landing';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { CheckoutComponent } from './checkout/checkout.component';

export default [
    { path: '', component: Landing },
    { path: 'profile', component: UserProfileComponent },
    { path: 'checkout', component: CheckoutComponent }

    // { path: 'product/:id', component: ProductComponent },
    // { path: 'cart', component: CartComponent },
] as Routes;
