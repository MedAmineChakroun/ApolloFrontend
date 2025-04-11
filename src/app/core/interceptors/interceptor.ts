import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
    const token = localStorage.getItem('jwtToken');

    if (token) {
        const clonedRequest = req.clone({
            setHeaders: { Authorization: `Bearer ${token}` }
        });

        return next(clonedRequest);
    }

    return next(req);
};
