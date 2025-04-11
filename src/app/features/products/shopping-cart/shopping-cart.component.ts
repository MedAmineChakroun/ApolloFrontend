import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { ToastrService } from 'ngx-toastr';
import { Store } from '@ngrx/store';
import { CartState } from '../../../store/cart/cart.reducers';
import { selectCartItems, selectCartItemCount, selectCartTotal } from '../../../store/cart/cart.selectors';
import { Observable } from 'rxjs';
import * as CartActions from '../../../store/cart/cart.actions';
import { CartItem } from '../../../models/cart-item';
import { CartService } from '../../../core/services/cart.service';
import { ConfirmationService } from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
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

    constructor(
        private router: Router,
        private toastr: ToastrService,
        private store: Store<{ cart: CartState }>,
        private cartService: CartService,
        private confirmationService: ConfirmationService
    ) {
        this.cartItems$ = this.store.select(selectCartItems);
        this.cartItemCount$ = this.store.select(selectCartItemCount);
        this.cartTotal$ = this.store.select(selectCartTotal);

        // Subscribe to keep track of current total
        this.cartTotal$.subscribe((total) => {
            this.currentTotal = total;
        });
    }

    ngOnInit(): void {}

    removeFromCart(productId: number): void {
        this.store.dispatch(CartActions.removeFromCart({ productId }));
        this.toastr.success('Item removed from cart');
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity > 0) {
            this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
            this.toastr.success('Quantity updated');
        }
    }

    clearCart(): void {
        this.store.dispatch(CartActions.clearCart());
        this.toastr.info('Cart cleared');
    }

    continueShopping(): void {
        this.router.navigate(['/store/products']);
    }

    PasserCommande(): void {
        //ask for confirmation
        this.confirmationService.confirm({
            message: 'Êtes-vous sûr de vouloir passer commande ?',
            header: 'Confirmation de commande',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                //traiter la commande
                this.router.navigate(['/store/products']);
            }
        });
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

    getTotal(): Observable<number> {
        return this.cartService.getCartTotal();
    }

    getItemCount(): Observable<number> {
        return this.cartService.getCartItemCount();
    }
}
