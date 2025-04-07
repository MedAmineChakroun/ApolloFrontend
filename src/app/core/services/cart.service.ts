import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../models/Product';
import { CartItem } from '../../models/cart-item';
import * as CartActions from '../../store/cart/cart.actions';
import { selectCartItems } from '../../store/cart/cart.selectors';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    constructor(private store: Store) {
        // Load cart from localStorage on initialization
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.store.dispatch(CartActions.setCartItems({ items: JSON.parse(savedCart) }));
        }
    }

    getCartItems(): Observable<CartItem[]> {
        return this.store.select(selectCartItems);
    }

    addToCart(product: Product, quantity: number = 1): void {
        const item: CartItem = { product, quantity };
        this.store.dispatch(CartActions.addToCart({ item }));
        this.saveCartToStorage();
    }

    removeFromCart(productId: number): void {
        this.store.dispatch(CartActions.removeFromCart({ productId }));
        this.saveCartToStorage();
    }

    updateQuantity(productId: number, quantity: number): void {
        this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
        this.saveCartToStorage();
    }

    clearCart(): void {
        this.store.dispatch(CartActions.clearCart());
        this.saveCartToStorage();
    }

    getCartTotal(): Observable<number> {
        return this.store.select(selectCartItems).pipe(map((items) => items.reduce((total, item) => total + item.product.artPrixVente * item.quantity, 0)));
    }

    getCartItemCount(): Observable<number> {
        return this.store.select(selectCartItems).pipe(map((items) => items.reduce((total, item) => total + item.quantity, 0)));
    }

    private saveCartToStorage(): void {
        this.store.select(selectCartItems).subscribe((items) => {
            localStorage.setItem('cart', JSON.stringify(items));
        });
    }
}
