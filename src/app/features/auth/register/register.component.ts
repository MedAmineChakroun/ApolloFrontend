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
import { InputMaskModule } from 'primeng/inputmask';
import { DropdownModule } from 'primeng/dropdown';
import { FormStateService } from './form-state.service';
import { AuthNavbar } from '../auth-navbar/auth-navbar.component';

interface CountryCode {
    name: string;
    code: string;
    dialCode: string;
}

export interface RegisterDto {
    name: string;
    email: string;
    password: string;
    city: string;
    country: string;
    postalCode: string;
    address: string;
    phone: string;
}

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, InputMaskModule, DropdownModule, AuthNavbar],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
    registerDto = new Register();
    loading = false;
    errorMessage = '';
    selectedCountryCode: CountryCode | null = null;
    phoneNumber: string = '';

    countryCodes: CountryCode[] = [
        { name: 'Tunisia', code: 'TN', dialCode: '+216' },
        { name: 'United States', code: 'US', dialCode: '+1' },
        { name: 'United Kingdom', code: 'GB', dialCode: '+44' },
        { name: 'France', code: 'FR', dialCode: '+33' },
        { name: 'Germany', code: 'DE', dialCode: '+49' },
        { name: 'Italy', code: 'IT', dialCode: '+39' },
        { name: 'Spain', code: 'ES', dialCode: '+34' },
        { name: 'Morocco', code: 'MA', dialCode: '+212' },
        { name: 'Algeria', code: 'DZ', dialCode: '+213' },
        { name: 'Egypt', code: 'EG', dialCode: '+20' }
    ];

    constructor(
        private authService: AuthenticationService,
        private router: Router,
        private formStateService: FormStateService
    ) {}

    ngOnInit() {
        // Try to restore form state if exists
        const savedState = this.formStateService.getFormState();
        if (savedState) {
            this.registerDto = savedState.registerData;
            this.phoneNumber = savedState.phoneNumber;
            this.selectedCountryCode = savedState.selectedCountryCode;
        } else {
            // Set Tunisia as default country code (only if no saved state)
            this.selectedCountryCode = this.countryCodes.find((c) => c.code === 'TN') || null;
        }
    }

    onCountryCodeChange() {
        // Update the phone mask based on the selected country
        this.phoneNumber = ''; // Reset phone number when country changes
    }

    getPhoneMaskPattern(): string {
        // Different patterns for different countries
        switch (this.selectedCountryCode?.code) {
            case 'TN':
                return '99 999 999';
            case 'US':
                return '(999) 999-9999';
            default:
                return '99 999 9999';
        }
    }

    register() {
        this.loading = true;
        this.errorMessage = '';

        // Validation before sending to service
        if (!this.validateForm()) {
            this.loading = false;
            return;
        }

        // Combine country code and phone number
        const fullPhoneNumber = this.selectedCountryCode?.dialCode + ' ' + this.phoneNumber;

        // Create registration data object using the interface
        const registrationData: RegisterDto = {
            name: this.registerDto.name,
            email: this.registerDto.email,
            password: this.registerDto.password,
            phone: fullPhoneNumber,
            address: this.registerDto.address,
            city: this.registerDto.city,
            postalCode: this.registerDto.postalCode,
            country: this.registerDto.country
        };

        console.log('dto', registrationData);
        this.authService.register(registrationData as Register).subscribe({
            next: () => {
                console.log('Registration successful');
                // Clear form state on successful registration
                this.formStateService.clearFormState();
                this.router.navigate(['auth/login']);
            },
            error: (err) => {
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
        if (!this.selectedCountryCode) {
            errors.push('Please select a country code');
        }
        if (!this.phoneNumber) {
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

    openTermsConditions() {
        // Save form state before navigating
        this.formStateService.saveFormState(this.registerDto, this.phoneNumber, this.selectedCountryCode);
        this.router.navigate(['/auth/terms-conditions']);
    }
}
