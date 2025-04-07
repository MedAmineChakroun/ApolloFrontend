import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { CartState } from '../../../store/cart/cart.reducers';
import { selectCartItems, selectCartTotal } from '../../../store/cart/cart.selectors';
import { Observable } from 'rxjs';
import { CartItem } from '../../../models/cart-item';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ToastrService } from 'ngx-toastr';
import * as CartActions from '../../../store/cart/cart.actions';
import { take } from 'rxjs/operators';

@Component({
    selector: 'app-checkout',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule],
    templateUrl: './checkout.component.html',
    styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {
    cartItems$: Observable<CartItem[]>;
    cartTotal$: Observable<number>;
    shippingAddress = {
        fullName: '',
        address: '',
        city: '',
        postalCode: '',
        country: ''
    };
    paymentInfo = {
        cardNumber: '',
        expiryDate: '',
        cvv: ''
    };

    constructor(
        private store: Store<{ cart: CartState }>,
        private router: Router,
        private toastr: ToastrService
    ) {
        this.cartItems$ = this.store.select(selectCartItems);
        this.cartTotal$ = this.store.select(selectCartTotal);
    }

    ngOnInit(): void {}

    handleImageError(event: any): void {
        event.target.src = 'assets/general/product-default.png';
    }

    placeOrder(): void {
        // Vérifier si les informations de livraison sont complètes
        if (!this.isShippingInfoValid()) {
            this.toastr.error('Please fill in all shipping information');
            return;
        }

        // Vérifier si les informations de paiement sont complètes
        if (!this.isPaymentInfoValid()) {
            this.toastr.error('Please fill in all payment information');
            return;
        }

        // Vérifier si le panier n'est pas vide et traiter la commande
        this.cartItems$.pipe(take(1)).subscribe((items) => {
            if (items.length === 0) {
                this.toastr.error('Your cart is empty');
                return;
            }

            // Simuler le traitement de la commande
            this.store.dispatch(CartActions.clearCart());
            this.toastr.success('Order placed successfully!');
            this.router.navigate(['/store/customer/orders']);
        });
    }

    private isShippingInfoValid(): boolean {
        return this.shippingAddress.fullName.trim() !== '' && this.shippingAddress.address.trim() !== '' && this.shippingAddress.city.trim() !== '' && this.shippingAddress.postalCode.trim() !== '' && this.shippingAddress.country.trim() !== '';
    }

    private isPaymentInfoValid(): boolean {
        return this.paymentInfo.cardNumber.trim() !== '' && this.paymentInfo.expiryDate.trim() !== '' && this.paymentInfo.cvv.trim() !== '';
    }
}
