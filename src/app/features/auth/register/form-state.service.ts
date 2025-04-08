import { Injectable } from '@angular/core';
import { Register } from '../../../models/Register';

interface FormState {
    registerData: Register;
    phoneNumber: string;
    selectedCountryCode: any;
}

@Injectable({
    providedIn: 'root'
})
export class FormStateService {
    private formState: FormState | null = null;

    saveFormState(registerData: Register, phoneNumber: string, selectedCountryCode: any): void {
        this.formState = {
            registerData: { ...registerData },
            phoneNumber,
            selectedCountryCode
        };
    }

    getFormState(): FormState | null {
        return this.formState;
    }

    clearFormState(): void {
        this.formState = null;
    }
}
