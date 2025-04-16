import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { CartState } from '../../../store/cart/cart.reducers';
import { selectCartItems, selectCartItemCount, selectCartTotal } from '../../../store/cart/cart.selectors';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import * as CartActions from '../../../store/cart/cart.actions';
import { CartItem } from '../../../models/cart-item';
import { CartService } from '../../../core/services/cart.service';
import { CommandeService } from '../../../core/services/commande.service';
import { DocVenteDto } from '../../../models/Dtos/DocVenteDto';
import { Router } from '@angular/router';
import { selectUser } from '../../../store/user/user.selectors';
import { AuthenticationService } from '../../../core/services/authentication.service';
import { DocLigneDto } from '../../../models/Dtos/DocLigneDto';
import { StepperModule } from 'primeng/stepper';
import { DialogModule } from 'primeng/dialog';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [CommonModule, ButtonModule, StepperModule, DialogModule, FormsModule, CheckboxModule],
    providers: [],
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    cartItemCount$: Observable<number>;
    cartTotal$: Observable<number>;
    FREE_SHIPPING_THRESHOLD = 500;
    currentTotal = 0;
    totalTht = 0;
    TiersCode: string | null = null;
    TiersIntitule: string | null = null;
    docVentePiece: string | null = null;
    currentStep = 1;
    display = false;
    accepted = false;

    constructor(
        private toastr: ToastrService,
        private store: Store<{ cart: CartState }>,
        private cartService: CartService,
        private commandeService: CommandeService,
        private router: Router,
        private authService: AuthenticationService
    ) {
        this.cartItems$ = this.store.select(selectCartItems);
        this.cartItemCount$ = this.store.select(selectCartItemCount);
        this.cartTotal$ = this.store.select(selectCartTotal);

        // Subscribe to keep track of current total
        this.cartTotal$.subscribe((total) => {
            this.currentTotal = total;
        });

        // Subscribe to keep track of total HT
        this.cartItems$.pipe(map((items) => items.reduce((total, item) => total + item.product.artPrixVente * item.quantity, 0))).subscribe((total) => {
            this.totalTht = total;
        });
    }
    set() {
        if (this.accepted) this.currentStep = 2;
        else this.currentStep = 3;
    }
    open() {
        this.currentStep = 2;
        this.display = true;
    }

    close() {
        this.currentStep = 1;
        this.display = false;
    }
    ngOnInit(): void {
        if (this.authService.isAuthenticated()) {
            this.getClientFromStore();
        }
    }

    isAuthenticated(): boolean {
        return this.authService.isAuthenticated();
    }

    PasserCommande(): void {
        if (this.authService.isAuthenticated()) {
            //traiter la commande
            this.currentStep = 3;
            this.traiterCommande();
            this.close();
        }
    }
    traiterCommande(): void {
        try {
            this.creerDocument();
        } catch (error) {
            this.toastr.error('Erreur lors de la création de la commande');
        }
    }
    getClientFromStore(): void {
        this.store.select(selectUser).subscribe({
            next: (user) => {
                if (user) {
                    this.TiersCode = user.tiersCode;
                    this.TiersIntitule = user.tiersIntitule;
                }
            },
            error: (error) => {
                console.log(error);
            }
        });
    }
    creerDocument(): void {
        const docVenteDto: DocVenteDto = {
            docTiersCode: this.TiersCode || '',
            docTiersIntitule: this.TiersIntitule || '',
            docTht: this.totalTht,
            docTtc: this.currentTotal
        };
        this.commandeService.createDocumentVente(docVenteDto).subscribe({
            next: (response) => {
                this.docVentePiece = response.docPiece;
                console.log('Document created with piece:', this.docVentePiece);
                // Now that we have the docVentePiece, create the document lines
                this.creerDocumentLignes();
            },
            error: (error) => {
                console.error('Error creating document:', error);
                this.toastr.error('Erreur lors de la création du document');
            }
        });
    }
    creerDocumentLignes(): void {
        this.cartItems$.pipe(take(1)).subscribe((cartItems) => {
            let completedLines = 0;
            const totalLines = cartItems.length;

            if (totalLines === 0) {
                this.toastr.success('Commande passée avec succès');
                this.clearCart();
                return;
            }

            cartItems.forEach((item) => {
                const docLigneDto: DocLigneDto = {
                    ligneDocPiece: this.docVentePiece || '',
                    ligneArtCode: item.product.artCode,
                    ligneArtDesi: item.product.artIntitule,
                    ligneQte: item.quantity,
                    lignePu: item.product.artPrixVente,
                    ligneHt: item.product.artPrixVente * item.quantity,
                    ligneTtc: item.product.artPrixVente * (1 + item.product.artTvaTaux / 100) * item.quantity
                };

                console.log(docLigneDto);
                this.commandeService.createDocumentventeLigne(docLigneDto).subscribe({
                    next: (response) => {
                        console.log('Document ligne created successfully:', response);
                        completedLines++;
                        // Check if all lines are created
                        if (completedLines === totalLines) {
                            this.toastr.success('Commande passée avec succès');
                            this.clearCart();
                        }
                    },
                    error: (error) => {
                        console.error('Error creating document ligne:', error);
                        this.toastr.error('Erreur lors de la création des lignes de commande');
                    }
                });
            });
        });
    }
    removeFromCart(productId: number): void {
        this.store.dispatch(CartActions.removeFromCart({ productId }));
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity > 0) {
            this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
            this.toastr.success('Quantity updated');
        }
    }

    clearCart(): void {
        this.cartService.clearCart();
    }

    continueShopping(): void {
        this.router.navigate(['/store/products']);
    }

    handleImageError(event: any): void {
        event.target.src = 'assets/general/product-default.png';
    }

    isEligibleForFreeShipping(): boolean {
        return this.currentTotal >= this.FREE_SHIPPING_THRESHOLD;
    }

    getProgressWidth(): string {
        const progress = (this.currentTotal / this.FREE_SHIPPING_THRESHOLD) * 100;
        return `${Math.min(progress, 100)}%`;
    }
}
