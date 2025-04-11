import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable, take } from 'rxjs';
import { map } from 'rxjs/operators';
import { Product } from '../../models/Product';
import { CartItem } from '../../models/cart-item';
import * as CartActions from '../../store/cart/cart.actions';
import { selectCartItems } from '../../store/cart/cart.selectors';

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private readonly CART_STORAGE_KEY = 'cart';

    constructor(private store: Store) {
        this.loadCartFromStorage();
        // Subscribe to cart changes to keep localStorage in sync
        this.store.select(selectCartItems).subscribe((items) => {
            this.saveCartToStorage();
        });
    }

    private loadCartFromStorage(): void {
        try {
            const savedCart = localStorage.getItem(this.CART_STORAGE_KEY);
            if (savedCart) {
                const parsedItems = JSON.parse(savedCart);
                if (this.isValidCartItems(parsedItems)) {
                    this.store.dispatch(CartActions.setCartItems({ items: parsedItems }));
                } else {
                    console.warn('Invalid cart data found in localStorage, clearing it');
                    localStorage.removeItem(this.CART_STORAGE_KEY);
                }
            }
        } catch (error) {
            console.error('Error loading cart from localStorage:', error);
            localStorage.removeItem(this.CART_STORAGE_KEY);
        }
    }

    private isValidCartItems(items: any): items is CartItem[] {
        if (!Array.isArray(items)) return false;
        return items.every((item) => item && typeof item === 'object' && 'product' in item && 'quantity' in item && typeof item.quantity === 'number' && item.quantity > 0);
    }

    getCartItems(): Observable<CartItem[]> {
        return this.store.select(selectCartItems);
    }

    addToCart(product: Product, quantity: number = 1): void {
        if (quantity <= 0) {
            console.warn('Cannot add item with quantity <= 0');
            return;
        }

        this.getCartItems()
            .pipe(take(1))
            .subscribe((items) => {
                const existingItem = items.find((item) => item.product.artId === product.artId);

                if (existingItem) {
                    this.updateQuantity(product.artId, existingItem.quantity + quantity);
                } else {
                    const item: CartItem = { product, quantity };
                    this.store.dispatch(CartActions.addToCart({ item }));
                }
            });
    }

    removeFromCart(productId: number): void {
        this.store.dispatch(CartActions.removeFromCart({ productId }));
    }

    updateQuantity(productId: number, quantity: number): void {
        if (quantity <= 0) {
            this.removeFromCart(productId);
            return;
        }

        this.store.dispatch(CartActions.updateQuantity({ productId, quantity }));
    }

    clearCart(): void {
        this.store.dispatch(CartActions.clearCart());
        try {
            localStorage.removeItem(this.CART_STORAGE_KEY);
        } catch (error) {
            console.error('Error clearing cart from localStorage:', error);
        }
    }

    getCartTotal(): Observable<number> {
        return this.store.select(selectCartItems).pipe(map((items) => items.reduce((total, item) => total + item.product.artPrixVente * item.quantity, 0)));
    }

    getCartItemCount(): Observable<number> {
        return this.store.select(selectCartItems).pipe(map((items) => items.reduce((total, item) => total + item.quantity, 0)));
    }

    private saveCartToStorage(): void {
        this.store
            .select(selectCartItems)
            .pipe(take(1))
            .subscribe((items) => {
                try {
                    localStorage.setItem(this.CART_STORAGE_KEY, JSON.stringify(items));
                } catch (error) {
                    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
                        console.error('LocalStorage quota exceeded. Cart data could not be saved.');
                        // Optionally notify the user or implement a fallback strategy
                    } else {
                        console.error('Error saving cart to localStorage:', error);
                    }
                }
            });
    }
}
