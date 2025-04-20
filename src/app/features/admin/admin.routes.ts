import { Routes } from '@angular/router';
import { Dashboard } from './dashboard/dashboard';
import { ClientsManagementComponent } from './clients-management/clients-management.component';
import { CommandesManagementComponent } from './commandes-management/commandes-management.component';
import { UserProfileComponent } from '../customer/user-profile/user-profile.component';

export default [
    //exemple
    { path: 'dashboard', component: Dashboard },
    { path: 'clients', component: ClientsManagementComponent },
    { path: 'clients/sync', component: ClientsManagementComponent },
    { path: 'orders', component: CommandesManagementComponent },
    { path: 'orders/sync', component: CommandesManagementComponent },
    { path: 'users/:id', component: UserProfileComponent }
    // { path: 'sellers', component: SellersComponent },
] as Routes;
