import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';
import { AuthenticationService } from '../../../services/authentication.service';
import { Register } from '../../../models/Register';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    registerDto = new Register();
    loading = false;
    errorMessage = '';

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    register() {
        this.loading = true;
        this.errorMessage = '';
        this.authService.register(this.registerDto).subscribe({
            next: () => {
                console.log('Registration successful');
                this.router.navigate(['auth/login']);
            },
            error: (err) => {
                // Process different error formats
                if (Array.isArray(err)) {
                    // Handle array of error messages (like password requirements)
                    this.errorMessage = err.join('\n');
                } else if (typeof err === 'object') {
                    // If it's an object with multiple properties, try to extract useful info
                    this.errorMessage = Object.values(err).join('\n');
                } else if (typeof err === 'string') {
                    // Direct string error
                    this.errorMessage = err;
                } else {
                    // Fallback
                    this.errorMessage = 'Registration failed. Please check your information and try again.';
                }
                console.error('Registration error:', err);
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
}
