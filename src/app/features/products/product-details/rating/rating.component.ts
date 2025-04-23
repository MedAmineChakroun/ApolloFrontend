import { Component, Input, OnInit, CUSTOM_ELEMENTS_SCHEMA, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RatingModule } from 'primeng/rating';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { RatingDTO, RatingService } from '../../../../core/services/rating.service';
import { AuthenticationService } from '../../../../core/services/authentication.service';
import { Observable, take } from 'rxjs';
import { selectUserId } from '../../../../store/user/user.selectors';
import { Store } from '@ngrx/store';
import { Rate } from '../../../../models/Rate';

@Component({
    selector: 'app-rating',
    standalone: true,
    imports: [CommonModule, FormsModule, RatingModule, ToastModule],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    templateUrl: './rating.component.html',
    styleUrls: ['./rating.component.css'],
    providers: [MessageService]
})
export class RatingComponent implements OnInit {
    @Input() productId!: number;

    userRating: number = 0;
    averageRating: number = 0;
    userId: number = 0;

    userHasRated: boolean = false;
    isLoggedIn: boolean = false;

    // Use inject() function with explicit types
    private ratingService: RatingService = inject(RatingService);
    private authService: AuthenticationService = inject(AuthenticationService);
    private messageService: MessageService = inject(MessageService);
    private store: Store = inject(Store);

    ngOnInit(): void {
        this.isLoggedIn = this.authService.isAuthenticated();
        this.SetUserId();
        this.loadProductRating();
    }

    SetUserId() {
        if (this.isLoggedIn) {
            this.store
                .select(selectUserId)
                .pipe(take(1))
                .subscribe({
                    next: (userId: number | undefined) => {
                        if (userId !== undefined) {
                            this.userId = userId;
                            this.loadUserRating();
                        } else {
                            console.warn('User ID is undefined');
                        }
                    },
                    error: (error: any) => {
                        console.error('Error fetching user ID:', error);
                    }
                });
        }
    }

    loadProductRating(): void {
        this.ratingService.getAverageRating(this.productId).subscribe({
            next: (avgRating: number) => {
                this.averageRating = avgRating;
            },
            error: (error: any) => {
                console.error('Error loading average rating:', error);
            }
        });
    }

    loadUserRating(): void {
        if (this.isLoggedIn && this.userId > 0) {
            this.ratingService.getRatingForProduct(this.productId, this.userId).subscribe({
                next: (userRating: Rate) => {
                    if (userRating) {
                        // Use the "rating" property from the Rate interface
                        console.log('User Rating:', userRating); // Debugging line
                        this.userRating = userRating.stars;
                        this.userHasRated = true;
                    }
                },
                error: (error) => {
                    if (error.status !== 404) {
                        console.error('Error loading user rating:', error);
                    }
                }
            });
        }
    }

    onRateChange(value: number): void {
        if (!this.isLoggedIn) {
            this.messageService.add({
                severity: 'info',
                summary: 'Information',
                detail: 'Veuillez vous connecter pour noter ce produit.'
            });
            return;
        }

        const ratingDTO: RatingDTO = {
            productId: this.productId,
            userId: this.userId,
            stars: value // Fixed: use the value parameter
        };

        this.ratingService.addRating(ratingDTO).subscribe({
            next: (response) => {
                this.userHasRated = true;
                this.userRating = value;
                // Refresh average rating after user rates
                this.loadProductRating();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Succès',
                    detail: 'Votre note a été enregistrée.'
                });
            },
            error: (error) => {
                console.error('Error saving rating:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Erreur',
                    detail: "Impossible d'enregistrer votre note."
                });
            }
        });
    }
}
