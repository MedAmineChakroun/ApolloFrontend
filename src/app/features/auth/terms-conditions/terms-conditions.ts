import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { DatePipe, CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthNavbar } from '../auth-navbar/auth-navbar.component';

@Component({
    selector: 'app-terms-conditions',
    standalone: true,
    imports: [RouterModule, ButtonModule, AccordionModule, DividerModule, DatePipe, CommonModule, AuthNavbar],
    templateUrl: './terms-conditions.html',
    styleUrls: ['./terms-conditions.css']
})
export class TermsConditions {
    currentDate = new Date();

    constructor(private router: Router) {}

    goBackToRegister() {
        this.router.navigate(['/auth/register']);
    }
}
