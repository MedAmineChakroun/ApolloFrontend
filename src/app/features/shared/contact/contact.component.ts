import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastrService } from 'ngx-toastr';
import { RippleModule } from 'primeng/ripple';
import { TooltipModule } from 'primeng/tooltip';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, TextareaModule, ButtonModule, CardModule, RippleModule, TooltipModule],
    animations: [
        trigger('fadeIn', [
            state(
                'void',
                style({
                    opacity: 0,
                    transform: 'translateY(20px)'
                })
            ),
            transition('void => *', [animate('0.4s ease-out')])
        ]),
        trigger('pulse', [state('normal', style({ transform: 'scale(1)' })), state('pulse', style({ transform: 'scale(1.05)' })), transition('normal <=> pulse', animate('0.3s ease-in-out'))])
    ]
})
export class ContactComponent implements OnInit {
    recipientEmail = 'medaminechakroun520@gmail.com';
    contactForm!: FormGroup;
    loading: boolean = false;
    submitState: 'normal' | 'pulse' = 'normal';

    constructor(
        private fb: FormBuilder,
        private contactService: ContactService,
        private toast: ToastrService
    ) {}

    ngOnInit(): void {
        this.initForm();
    }

    initForm(): void {
        this.contactForm = this.fb.group({
            email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')]],
            subject: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]]
        });

        // Add value change listener to pulse the submit button when form becomes valid
        this.contactForm.statusChanges.subscribe((status) => {
            if (status === 'VALID') {
                this.pulseSubmitButton();
            }
        });
    }

    pulseSubmitButton(): void {
        this.submitState = 'pulse';
        setTimeout(() => {
            this.submitState = 'normal';
        }, 300);
    }

    onSubmit(): void {
        if (this.contactForm.valid) {
            this.loading = true;
            console.log('Form submitted:', this.contactForm.value);

            this.contactService.sendEmail(this.contactForm.value).subscribe({
                next: (response) => {
                    console.log('Email sent:', response);
                    this.toast.success('Your message has been sent successfully!', 'Thank You', {
                        timeOut: 5000,
                        positionClass: 'toast-bottom-right',
                        progressBar: true
                    });
                    this.contactForm.reset();
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Email sending failed:', err);
                    this.toast.error("We couldn't send your message. Please try again later.", 'Oops!', {
                        timeOut: 5000,
                        positionClass: 'toast-bottom-right',
                        progressBar: true
                    });
                    this.loading = false;
                }
            });
        } else {
            // Mark all fields as touched to trigger validation messages
            Object.keys(this.contactForm.controls).forEach((key) => {
                this.contactForm.get(key)?.markAsTouched();
            });

            // Show error toast
            this.toast.warning('Please check the form for errors', 'Form Incomplete', {
                timeOut: 3000,
                positionClass: 'toast-bottom-right'
            });
        }
    }

    // Helper method to get specific error messages
    getErrorMessage(controlName: string): string {
        const control = this.contactForm.get(controlName);

        if (!control || !control.errors || !control.touched) {
            return '';
        }

        if (control.errors['required']) {
            return 'This field is required';
        }

        if (control.errors['email'] || control.errors['pattern']) {
            return 'Please enter a valid email address';
        }

        if (control.errors['minlength']) {
            return `Minimum ${control.errors['minlength'].requiredLength} characters required`;
        }

        if (control.errors['maxlength']) {
            return `Maximum ${control.errors['maxlength'].requiredLength} characters allowed`;
        }

        return 'Invalid input';
    }
}
