import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { CartState } from '../../../store/cart/cart.reducers';
import { selectCartItems, selectCartItemCount, selectCartTotal } from '../../../store/cart/cart.selectors';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import * as CartActions from '../../../store/cart/cart.actions';
import { CartItem } from '../../../models/cart-item';
import { CartService } from '../../../core/services/cart.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CommandeService } from '../../../core/services/commande.service';
import { DocVenteDto } from '../../../models/Dtos/DocVenteDto';
import { Router } from '@angular/router';
import { selectUser } from '../../../store/user/user.selectors';
import { AuthenticationService } from '../../../core/services/authentication.service';
@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [CommonModule, ButtonModule, ConfirmDialogModule],
    providers: [ConfirmationService],
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

    constructor(
        private toastr: ToastrService,
        private store: Store<{ cart: CartState }>,
        private cartService: CartService,
        private confirmationService: ConfirmationService,
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
            this.confirmationService.confirm({
                message: 'Êtes-vous sûr de vouloir passer cette commande ?',
                header: 'Confirmation de commande',
                icon: 'pi pi-exclamation-triangle',
                accept: () => {
                    //traiter la commande
                    this.traiterCommande();
                }
            });
        }
    }
    traiterCommande(): void {
        try {
            this.creerDocument();
            this.creerDocumentLignes();
            //  this.clearCart();
            this.toastr.success('Commande passée avec succès');
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
                console.log(this.docVentePiece);
                console.log(response);
            },
            error: (error) => {
                console.log(error);
            }
        });
    }
    creerDocumentLignes(): void {
        console.log('création des lignes du document');
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
        this.toastr.info('Cart cleared');
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
