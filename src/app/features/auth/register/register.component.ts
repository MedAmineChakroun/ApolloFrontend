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
import { SynchronisationService } from '../../../core/services/synchronisation.service';
import { Store } from '@ngrx/store';
import { selectUserCode } from '../../../store/user/user.selectors';
import { ToastrService } from 'ngx-toastr';
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

    // Individual error flags
    usernameError: boolean = false;
    nameRequired: boolean = false;
    emailRequired: boolean = false;
    emailInvalid: boolean = false;
    passwordRequired: boolean = false;
    confirmPasswordRequired: boolean = false;
    passwordMismatch: boolean = false;
    countryCodeRequired: boolean = false;
    phoneRequired: boolean = false;
    addressRequired: boolean = false;
    cityRequired: boolean = false;
    postalCodeRequired: boolean = false;
    countryRequired: boolean = false;
    termsRequired: boolean = false;

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
        private formStateService: FormStateService,
        private synchronisationService: SynchronisationService,
        private store: Store,
        private toastr: ToastrService
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

    // Reset all error flags
    resetErrors() {
        this.usernameError = false;
        this.nameRequired = false;
        this.emailRequired = false;
        this.emailInvalid = false;
        this.passwordRequired = false;
        this.confirmPasswordRequired = false;
        this.passwordMismatch = false;
        this.countryCodeRequired = false;
        this.phoneRequired = false;
        this.addressRequired = false;
        this.cityRequired = false;
        this.postalCodeRequired = false;
        this.countryRequired = false;
        this.termsRequired = false;
        this.errorMessage = '';
    }

    register() {
        this.loading = true;
        this.resetErrors();

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
                // Clear form state on successful registration
                this.toastr.success('Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.');
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
        let isValid = true;

        // Check username format
        if (this.registerDto.name) {
            if (!/^[a-zA-Z0-9]+$/.test(this.registerDto.name)) {
                this.usernameError = true;
                isValid = false;
            }
        } else {
            this.nameRequired = true;
            isValid = false;
        }

        // Check email
        if (!this.registerDto.email) {
            this.emailRequired = true;
            isValid = false;
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.registerDto.email)) {
            this.emailInvalid = true;
            isValid = false;
        }

        // Check password
        if (!this.registerDto.password) {
            this.passwordRequired = true;
            isValid = false;
        }

        // Check confirm password
        if (!this.registerDto.confirmPassword) {
            this.confirmPasswordRequired = true;
            isValid = false;
        } else if (this.registerDto.password !== this.registerDto.confirmPassword) {
            this.passwordMismatch = true;
            isValid = false;
        }

        // Check country code
        if (!this.selectedCountryCode) {
            this.countryCodeRequired = true;
            isValid = false;
        }

        // Check phone number
        if (!this.phoneNumber) {
            this.phoneRequired = true;
            isValid = false;
        }

        // Check address
        if (!this.registerDto.address) {
            this.addressRequired = true;
            isValid = false;
        }

        // Check city
        if (!this.registerDto.city) {
            this.cityRequired = true;
            isValid = false;
        }

        // Check postal code
        if (!this.registerDto.postalCode) {
            this.postalCodeRequired = true;
            isValid = false;
        }

        // Check country
        if (!this.registerDto.country) {
            this.countryRequired = true;
            isValid = false;
        }

        // Check terms agreement
        if (!this.registerDto.agreeTerms) {
            this.termsRequired = true;
            isValid = false;
        }

        return isValid;
    }

    openTermsConditions() {
        // Save form state before navigating
        this.formStateService.saveFormState(this.registerDto, this.phoneNumber, this.selectedCountryCode);
        this.router.navigate(['/auth/terms-conditions']);
    }
}
