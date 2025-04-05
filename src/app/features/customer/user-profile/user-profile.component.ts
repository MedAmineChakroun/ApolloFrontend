import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/client-service.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { selectUser } from '../../../store/user/user.selectors';
import { Client } from '../../../models/Client';
import { jwtDecode } from 'jwt-decode';
import { updateUser } from '../../../store/user/user.actions';
import { InputMaskModule } from 'primeng/inputmask';
interface DecodedToken {
    Id: string;
    ClientId: string;
    UserName: string;
    sub: string;
    email: string;
    exp: number;
    jti: string;
    role: string;
}

@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, ButtonModule, InputMaskModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    profileForm: FormGroup;
    userId: number | null = null;
    isAvatarLoading: boolean = false;
    clientData: Client | null = null;
    userEmail: string = '';

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private toastr: ToastrService,
        private store: Store
    ) {
        this.profileForm = this.fb.group({
            id: [''],
            userName: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            address: ['', Validators.required],
            postalCode: ['', Validators.required],
            city: ['', Validators.required],
            country: ['', Validators.required],
            phone: ['', Validators.required]
        });
    }

    ngOnInit(): void {
        // Get email from JWT token
        this.getUserEmailFromToken();

        // Get user data from store
        this.store.select(selectUser).subscribe(
            (client) => {
                if (client) {
                    this.clientData = client;
                    this.userId = typeof client.tiersId === 'string' ? parseInt(client.tiersId, 10) : client.tiersId;

                    this.profileForm.patchValue({
                        id: client.tiersId,
                        userName: client.tiersIntitule,
                        email: this.userEmail, // Use email from token
                        address: client.tiersAdresse1,
                        postalCode: client.tiersCodePostal,
                        city: client.tiersVille,
                        country: client.tiersPays,
                        phone: client.tiersTel1
                    });
                }
            },
            (error) => {
                this.toastr.error('Erreur lors du chargement des données utilisateur.');
                console.error('Store error:', error);
            }
        );
    }

    private getUserEmailFromToken(): void {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            this.toastr.warning('Token JWT non trouvé.');
            return;
        }

        try {
            const decodedToken = jwtDecode<DecodedToken>(token);
            if (decodedToken && decodedToken.email) {
                this.userEmail = decodedToken.email;
                this.profileForm.get('email')?.disable(); // Disable email field since it can't be changed
            } else {
                this.toastr.warning('Email non trouvé dans le token.');
            }
        } catch (error) {
            this.toastr.error('Erreur lors du décodage du token.');
            console.error('Token decode error:', error);
        }
    }

    avatarUrl: string = 'assets/general/default-avatar.jpg';

    triggerFileInput() {
        const fileInput = document.getElementById('avatarInput') as HTMLInputElement;
        if (fileInput) {
            fileInput.click();
        }
    }

    onAvatarChange(event: any) {
        const file = event.target.files?.[0];
        if (file) {
            this.isAvatarLoading = true;
            const reader = new FileReader();

            reader.onload = () => {
                setTimeout(() => {
                    this.avatarUrl = reader.result as string;
                    this.toastr.success('Avatar updated successfully!');
                    this.isAvatarLoading = false;
                }, 1000);
            };

            reader.onerror = (error) => {
                this.toastr.error('Error updating avatar');
                this.isAvatarLoading = false;
            };

            reader.readAsDataURL(file);
        }
    }

    removeAvatar() {
        this.isAvatarLoading = true;
        setTimeout(() => {
            this.avatarUrl = 'assets/general/default-avatar.jpg';
            this.toastr.success('Avatar removed successfully!');
            this.isAvatarLoading = false;
        }, 1000);
    }

    onSubmit() {
        if (!this.userId) {
            this.toastr.error('User ID not found', 'Update Failed');
            return;
        }

        if (this.profileForm.invalid) {
            this.markFormAsTouched();
            this.toastr.error('Please fill all required fields', 'Form Invalid');
            return;
        }

        const updateData = {
            name: this.profileForm.value.userName,
            address: this.profileForm.value.address,
            postalCode: this.profileForm.value.postalCode,
            city: this.profileForm.value.city,
            country: this.profileForm.value.country,
            phone: this.profileForm.value.phone
        };

        this.userService.updateUserProfile(this.userId, updateData).subscribe({
            next: () => this.toastr.success('Profile updated successfully'),
            //update store fetch from db
            complete: () => this.updateStore(),

            error: (err) => this.handleUpdateError(err)
        });
    }
    private updateStore() {
        if (this.userId) {
            this.userService.getUserProfile(this.userId).subscribe((user) => {
                this.store.dispatch(updateUser({ client: user }));
            });
        }
    }
    private markFormAsTouched() {
        Object.values(this.profileForm.controls).forEach((control) => {
            control.markAsTouched();
        });
    }

    private handleUpdateError(error: any) {
        console.error('Update error:', error);
        const errorMessage = error.error?.message || 'Failed to update profile';
        this.toastr.error(errorMessage, 'Update Error');
    }
}
