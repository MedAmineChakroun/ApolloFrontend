import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { Register } from '../../../models/Register';
import { DropdownModule } from 'primeng/dropdown';
import { InputMaskModule } from 'primeng/inputmask';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, DropdownModule, InputMaskModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
    registerDto = new Register();
    loading = false;
    errorMessage = '';
    countries: any[] = [];

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    ngOnInit() {
        // Initialize countries list with proper format
        this.countries = [
            { name: 'United States', code: 'US' },
            { name: 'Canada', code: 'CA' },
            { name: 'Tunisia', code: 'TN' },
            { name: 'Germany', code: 'DE' },
            { name: 'France', code: 'FR' }
        ];
    }

    register() {
        this.loading = true;
        this.errorMessage = '';

        // Validation before sending to service
        if (!this.validateForm()) {
            this.loading = false;
            return;
        }

        // Create a new Register instance with all required fields
        const registrationData = new Register();
        registrationData.name = this.registerDto.name;
        registrationData.email = this.registerDto.email;
        registrationData.password = this.registerDto.password;
        registrationData.phone = this.registerDto.phone;
        registrationData.address = this.registerDto.address;
        registrationData.city = this.registerDto.city;
        registrationData.postalCode = this.registerDto.postalCode;
        registrationData.country = this.registerDto.country;
        console.log(registrationData);
        this.authService.register(registrationData).subscribe({
            next: () => {
                console.log('Registration successful');
                this.router.navigate(['auth/login']);
            },
            error: (err) => {
                // Process different error formats
                if (Array.isArray(err)) {
                    this.errorMessage = err.join('\n');
                } else if (typeof err === 'object') {
                    this.errorMessage = Object.values(err).join('\n');
                } else if (typeof err === 'string') {
                    this.errorMessage = err;
                } else {
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

    validateForm(): boolean {
        let errors = [];

        // Check required fields
        if (!/^[a-zA-Z0-9]+$/.test(this.registerDto.name)) {
            errors.push('Name should not contain special characters');
        }
        if (!this.registerDto.name) {
            errors.push('Name is required');
        }
        if (!this.registerDto.email) {
            errors.push('Email is required');
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerDto.email)) {
            errors.push('Please enter a valid email address');
        }
        if (!this.registerDto.password) {
            errors.push('Password is required');
        }
        if (!this.registerDto.confirmPassword) {
            errors.push('Please confirm your password');
        } else if (this.registerDto.password !== this.registerDto.confirmPassword) {
            errors.push('Passwords do not match');
        }
        if (!this.registerDto.phone) {
            errors.push('Phone number is required');
        }
        if (!this.registerDto.address) {
            errors.push('Address is required');
        }
        if (!this.registerDto.city) {
            errors.push('City is required');
        }
        if (!this.registerDto.postalCode) {
            errors.push('Postal code is required');
        }
        if (!this.registerDto.country) {
            errors.push('Country is required');
        }
        if (!this.registerDto.agreeTerms) {
            errors.push('You must agree to the Terms of Service');
        }

        // If there are errors, display them
        if (errors.length > 0) {
            this.errorMessage = errors.join('\n');
            return false;
        }

        return true;
    }
}
