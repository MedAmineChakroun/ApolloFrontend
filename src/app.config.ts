import { provideHttpClient, withFetch } from '@angular/common/http';
import { ApplicationConfig } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideRouter, withEnabledBlockingInitialNavigation, withInMemoryScrolling } from '@angular/router';
import Aura from '@primeng/themes/aura';
import { providePrimeNG } from 'primeng/config';
import { appRoutes } from './app.routes';
import { provideStore } from '@ngrx/store';
import { userReducer } from './app/store/user/user.reducers';
import { provideToastr } from 'ngx-toastr';
import { provideAnimations } from '@angular/platform-browser/animations';
import { cartReducer } from './app/store/cart/cart.reducers';
import { withInterceptors } from '@angular/common/http';
import { AuthInterceptor } from './app/core/interceptors/interceptor';
export const appConfig: ApplicationConfig = {
    providers: [
        provideRouter(appRoutes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' }), withEnabledBlockingInitialNavigation()),
        provideHttpClient(withFetch(), withInterceptors([AuthInterceptor])),

        providePrimeNG({ theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } } }),
        provideStore({ user: userReducer, cart: cartReducer }),
        provideAnimations(),
        provideToastr({
            timeOut: 2500, // Duration before auto-close
            positionClass: 'toast-top-right', // Position of toasts
            preventDuplicates: true, // Avoid duplicate messages
            closeButton: true, // Show close button
            progressBar: true, // Show progress bar
            easing: 'ease-in-out', // Smooth entrance and exit
            easeTime: 300, // Animation duration
            extendedTimeOut: 1000
        })
    ]
};
