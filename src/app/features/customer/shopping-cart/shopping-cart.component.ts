import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { CartService } from '../../../core/services/cart.service';
import { CartItem } from '../../../core/services/cart.service';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
    selector: 'app-shopping-cart',
    standalone: true,
    imports: [CommonModule, ButtonModule, InputNumberModule, FormsModule],
    templateUrl: './shopping-cart.component.html',
    styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit, OnDestroy {
    cartItems: CartItem[] = [];
    private cartSubscription?: Subscription;
    readonly FREE_SHIPPING_THRESHOLD = 500;

    constructor(
        private cartService: CartService,
        private router: Router
    ) {}

    ngOnInit() {
        this.cartSubscription = this.cartService.getCartItems().subscribe((items) => {
            this.cartItems = items;
        });
    }

    ngOnDestroy() {
        if (this.cartSubscription) {
            this.cartSubscription.unsubscribe();
        }
    }

    updateQuantity(index: number, newQuantity: number) {
        if (newQuantity > 0) {
            const item = this.cartItems[index];
            if (item) {
                this.cartService.updateQuantity(Number(item.product.artId), newQuantity);
            }
        }
    }

    removeFromCart(index: number) {
        const item = this.cartItems[index];
        if (item) {
            this.cartService.removeFromCart(item.product.artId);
        }
    }

    clearCart() {
        this.cartService.clearCart();
    }

    getTotal(): number {
        return this.cartService.getCartTotal();
    }

    isEligibleForFreeShipping(): boolean {
        return this.getTotal() >= this.FREE_SHIPPING_THRESHOLD;
    }

    checkout() {
        this.router.navigate(['/store/checkout']);
    }

    continueShopping() {
        this.router.navigate(['/store/products']);
    }

    handleImageError(event: Event): void {
        const img = event.target as HTMLImageElement;
        img.src = 'assets/general/product-default.png';
    }
}
