import { Routes } from '@angular/router';
import { TermsConditions } from '../features/auth/terms-conditions/terms-conditions';

export default [{ path: '**', redirectTo: '/notfound' }] as Routes;
