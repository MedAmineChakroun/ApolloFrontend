import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextarea } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ContactService } from '../../../core/services/contact.service';
import { ToastrService } from 'ngx-toastr';

@Component({
    selector: 'app-contact',
    templateUrl: './contact.component.html',
    styleUrls: ['./contact.component.css'],
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, InputTextModule, ButtonModule, CardModule, InputTextarea]
})
export class ContactComponent implements OnInit {
    recipientEmail = 'medaminechakroun520@gmail.com';
    contactForm!: FormGroup;
    loading: boolean = false;
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
            email: ['', [Validators.required, Validators.email]],
            subject: ['', Validators.required],
            message: ['', Validators.required]
        });
    }

    onSubmit(): void {
        if (this.contactForm.valid) {
            this.loading = true;
            console.log('Form submitted:', this.contactForm.value);
            this.contactService.sendEmail(this.contactForm.value).subscribe({
                next: (response) => {
                    console.log('Email sent:', response);
                    this.toast.success('Email sent successfully');
                    this.contactForm.reset();
                    this.loading = false;
                },
                error: (err) => {
                    console.error('Email sending failed:', err);
                    this.toast.error('Email sending failed');
                    this.loading = false;
                }
            });
        } else {
            // Mark all fields as touched to trigger validation messages
            Object.keys(this.contactForm.controls).forEach((key) => {
                this.contactForm.get(key)?.markAsTouched();
            });
        }
    }
}
