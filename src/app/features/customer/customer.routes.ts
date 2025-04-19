import { Routes } from '@angular/router';
import { Landing } from '../landing/landing';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { OrdersComponent } from './orders/orders.component';
import { OrderDetailsComponent } from './order-details/order-details.component';
import { RoleGuard } from '../../core/guards/role.guard';
import { AuthGuard } from '../../core/guards/auth.guard';
export default [
    { path: '', component: Landing },
    { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['customer', 'admin'] } },
    { path: 'orders', component: OrdersComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['customer'] } },
    { path: 'orderDetails/:id', component: OrderDetailsComponent, canActivate: [AuthGuard, RoleGuard], data: { roles: ['customer', 'admin'] } }
    // { path: 'product/:id', component: ProductComponent },
    // { path: 'cart', component: CartComponent },
] as Routes;
