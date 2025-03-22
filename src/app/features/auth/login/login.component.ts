import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { JwtAuth } from '../../../models/JwtAuth';
import { Login } from '../../../models/Login';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { RippleModule } from 'primeng/ripple';
import { AppFloatingConfigurator } from '../../../layout/component/app.floatingconfigurator';

@Component({
    selector: 'app-login',
    imports: [CommonModule, ButtonModule, CheckboxModule, InputTextModule, PasswordModule, FormsModule, RouterModule, RippleModule, AppFloatingConfigurator],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    loginDto = new Login();
    jwtDto = new JwtAuth();
    checked: boolean = false;
    loading: boolean = false;
    errorMessage: string = '';

    constructor(
        private authService: AuthenticationService,
        private router: Router
    ) {}

    login() {
        this.loading = true;
        this.errorMessage = '';

        this.authService.login(this.loginDto).subscribe({
            next: (jwtDto) => {
                localStorage.setItem('jwtToken', jwtDto.token);
                console.log('Login successful');
                this.router.navigate(['/store/products']);
            },
            error: (err) => {
                console.error('Login failed', err);
                this.errorMessage = 'Invalid email or password.';
                this.loading = false;
            },
            complete: () => {
                this.loading = false;
            }
        });
    }
    register() {
        this.router.navigate(['auth/register']);
    }
}
