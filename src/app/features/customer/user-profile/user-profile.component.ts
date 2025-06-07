import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../core/services/client-service.service';
import { ToastrService } from 'ngx-toastr';
import { ButtonModule } from 'primeng/button';
import { Store } from '@ngrx/store';
import { selectUser, selectUserCode } from '../../../store/user/user.selectors';
import { Client } from '../../../models/Client';
import { jwtDecode } from 'jwt-decode';
import { updateUser } from '../../../store/user/user.actions';
import { InputMaskModule } from 'primeng/inputmask';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { InputTextModule } from 'primeng/inputtext';
import { ActivatedRoute } from '@angular/router';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { QRCodeComponent } from 'angularx-qrcode';
import { TooltipModule } from 'primeng/tooltip';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
    imports: [ReactiveFormsModule, CommonModule, ButtonModule, InputMaskModule, ProgressSpinnerModule, InputTextModule, TagModule, DialogModule, QRCodeComponent, TooltipModule],
    templateUrl: './user-profile.component.html',
    styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
    profileForm: FormGroup;
    userId: number | null = null;
    isAvatarLoading: boolean = false;
    clientData: Client | null = null;
    userEmail: string = '';
    routeUrl: boolean = false;
    role: string = ''; // Default role

    // QR Code related properties
    showQrCodeDialog: boolean = false;
    qrCodeData: string = '';
    qrCodeSize: number = 300;
    qrCodeDownloadLink: SafeUrl = '';

    constructor(
        private fb: FormBuilder,
        private userService: UserService,
        private toastr: ToastrService,
        private store: Store,
        private route: ActivatedRoute
    ) {
        this.profileForm = this.fb.group({
            id: [''],
            userName: [
                '',
                [
                    Validators.required,
                    Validators.minLength(6),
                    Validators.pattern('^[a-zA-Z]+$') // only letters
                ]
            ],
            email: ['', [Validators.required, Validators.email]],
            address: ['', Validators.required],
            postalCode: [
                '',
                [
                    Validators.required,
                    Validators.pattern('^[0-9]+$') // only numbers
                ]
            ],
            city: ['', Validators.required],
            country: ['', Validators.required],
            phone: [
                '',
                [
                    Validators.required,
                ]
            ]
        });
        
    }

    ngOnInit(): void {
        // Get email from JWT token
        const id = this.route.snapshot.paramMap.get('id') || '';
        this.routeUrl = id !== '' ? true : false;

        if (this.routeUrl) {
            this.userService.getUserByCode(id).subscribe({
                next: (data) => {
                    this.clientData = data;
                    console.log(data);
                    this.getRole(this.clientData.tiersId);
                    this.generateQrCodeData();
                },
                error: () => {
                    this.toastr.error('Erreur lors du chargement des données utilisateur.');
                }
            });
        } else {
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

                        this.generateQrCodeData();
                    }
                },
                (error) => {
                    this.toastr.error('Erreur lors du chargement des données utilisateur.');
                    console.error('Store error:', error);
                }
            );
        }
    }

    // Generate QR code data from client information
    generateQrCodeData(): void {
        if (!this.clientData) return;

        // Format with line breaks for better readability when scanned
        const formattedText = `Client: ${this.clientData.tiersIntitule}
ID: ${this.clientData.tiersCode}
Email: ${this.userEmail || this.clientData.tiersEmail || 'N/A'}
Phone: ${this.clientData.tiersTel1 || 'N/A'}
Address: ${this.clientData.tiersAdresse1 || 'N/A'}
City: ${this.clientData.tiersVille || 'N/A'}, ${this.clientData.tiersCodePostal || 'N/A'}
Country: ${this.clientData.tiersPays || 'N/A'}
Role: ${this.role || 'Customer'}`;

        this.qrCodeData = formattedText;
    }

    // Open QR code dialog
    openQrCodeDialog(): void {
        this.generateQrCodeData();
        this.showQrCodeDialog = true;
    }

    // Download QR code as image
    downloadQrCode(): void {
        const canvas = document.querySelector('canvas') as HTMLCanvasElement;
        if (!canvas) {
            this.toastr.error('Cannot find QR code canvas to download');
            return;
        }

        const link = document.createElement('a');
        const clientName = this.clientData?.tiersIntitule?.replace(/\s+/g, '_') || 'user';
        const timestamp = new Date().toISOString().slice(0, 10);
        link.download = `${clientName}_profile_qrcode_${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        this.toastr.success('QR code downloaded successfully');
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
            next: () => {
                this.toastr.success('Profile updated successfully');
                this.updateStore();
                if (this.userId !== null) {
                    this.userService.updateUserFlag(this.userId, 0).subscribe({
                        next: () => {}
                    });
                }
            },

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
    getRole(id: number) {
        this.userService.getUserRole(id).subscribe({
            next: (response) => {
                console.log(response);
                this.role = response.role;
            },
            error: (error) => {
                console.error('Error fetching user role:', error);
                this.toastr.error('Failed to fetch user role');
            }
        });
    }
}
