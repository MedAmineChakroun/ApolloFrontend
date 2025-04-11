import { Routes } from '@angular/router';
import { Landing } from '../landing/landing';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { OrdersComponent } from './orders/orders.component';
export default [
    { path: '', component: Landing },
    { path: 'profile', component: UserProfileComponent },
    { path: 'orders', component: OrdersComponent }
    // { path: 'product/:id', component: ProductComponent },
    // { path: 'cart', component: CartComponent },
] as Routes;
