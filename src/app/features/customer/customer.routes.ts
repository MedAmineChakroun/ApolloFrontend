import { Routes } from '@angular/router';
import { Landing } from '../landing/landing';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
export default [
    { path: '', component: Landing },
    { path: 'profile', component: UserProfileComponent },
    { path: 'orders', component: OrdersComponent },
    { path: 'orderDetails/:id', component: OrderDetailsComponent }
    // { path: 'product/:id', component: ProductComponent },
    // { path: 'cart', component: CartComponent },
] as Routes;
