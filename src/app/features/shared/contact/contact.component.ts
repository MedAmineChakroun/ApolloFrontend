import { Component, OnInit } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextarea } from 'primeng/inputtextarea';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

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

    constructor(private fb: FormBuilder) {}

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
            console.log('Form submitted:', this.contactForm.value);
            // TODO: Implement actual form submission logic
            // Reset form after submission
            this.contactForm.reset();
        } else {
            // Mark all fields as touched to trigger validation messages
            Object.keys(this.contactForm.controls).forEach((key) => {
                this.contactForm.get(key)?.markAsTouched();
            });
        }
    }
}
