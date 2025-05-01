import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ClientsManagementComponent } from './clients-management/clients-management.component';
import { CommandesManagementComponent } from './commandes-management/commandes-management.component';
import { UserProfileComponent } from '../customer/user-profile/user-profile.component';
import { ProductManagementComponent } from './product-management/product-management.component';
import { EditAddProductComponent } from './product-management/edit-add-product/edit-add-product.component';

export default [
    //exemple
    { path: 'dashboard', component: Dashboard },
    { path: 'clients', component: ClientsManagementComponent },
    { path: 'clients/sync', component: ClientsManagementComponent },
    { path: 'orders', component: CommandesManagementComponent },
    { path: 'orders/sync', component: CommandesManagementComponent },
    { path: 'products', component: ProductManagementComponent },
    { path: 'products/edit/:id', component: EditAddProductComponent },
    { path: 'products/add', component: EditAddProductComponent },
    { path: 'products/sync', component: ProductManagementComponent },
    { path: 'users/:id', component: UserProfileComponent },
    { path: 'synchronize/clients', component: ClientsManagementComponent },
    { path: 'synchronize/commandes', component: CommandesManagementComponent },
    { path: 'synchronize/products', component: ProductManagementComponent }
] as Routes;
