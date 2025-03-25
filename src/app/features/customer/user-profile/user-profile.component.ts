import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/user-service.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
@Component({
    selector: 'app-user-profile',
    standalone: true,
    imports: [ReactiveFormsModule, CommonModule, ButtonModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    profileForm: FormGroup;
    userId: string | null = null;
    isAvatarLoading: boolean = false;

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private toastr: ToastrService
    ) {
        this.profileForm = this.fb.group({
            id: [''],
            userName: [''],
            email: ['']
        });
    }

    ngOnInit(): void {
        this.userId = this.getUserIdFromToken();

        if (this.userId) {
            this.userService.getUserProfile(this.userId).subscribe(
                (user) => {
                    this.profileForm.patchValue({
                        id: this.userId,
                        userName: user.userName,
                        email: user.email
                    });
                },
                () => {
                    this.toastr.error('Erreur lors du chargement du profil.');
                }
            );
        } else {
            this.toastr.error("Impossible de récupérer l'ID utilisateur.");
        }
    }

    private getUserIdFromToken(): string | null {
        const token = localStorage.getItem('jwtToken');
        if (!token) {
            this.toastr.warning('Token JWT non trouvé.');
            return null;
        }

        const decodedToken = this.decodeToken(token);
        if (decodedToken && decodedToken.Id) {
            return decodedToken.Id;
        } else {
            this.toastr.error('ID utilisateur non trouvé dans le token.');
            return null;
        }
    }

    private decodeToken(token: string): any {
        try {
            const payload = token.split('.')[1];
            const decoded = atob(payload);
            return JSON.parse(decoded);
        } catch (error) {
            this.toastr.error('Erreur lors du décodage du token.');
            return null;
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
        if (this.userId) {
            this.userService.updateUserProfile(this.userId, this.profileForm.value).subscribe(
                () => {
                    this.toastr.success('Profil mis à jour avec succès', 'Succès !');
                },
                () => {
                    this.toastr.error('Erreur lors de la mise à jour du profil.');
                }
            );
        } else {
            this.toastr.error('Impossible de mettre à jour le profil : ID utilisateur non trouvé.');
        }
    }
}
