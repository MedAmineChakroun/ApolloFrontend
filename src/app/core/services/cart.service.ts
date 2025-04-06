import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../../models/Product';

export interface CartItem {
    product: Product;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);

    constructor() {
        // Load cart from localStorage on initialization
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            this.cartItems.next(JSON.parse(savedCart));
        }
    }

    getCartItems() {
        return this.cartItems.asObservable();
    }

    addToCart(product: Product, quantity: number = 1) {
        const currentItems = this.cartItems.value;
        const existingItem = currentItems.find((item) => item.product.artId === product.artId);

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            currentItems.push({ product, quantity });
        }

        this.cartItems.next(currentItems);
        this.saveCartToStorage();
    }

    removeFromCart(productId: number) {
        const currentItems = this.cartItems.value;
        this.cartItems.next(currentItems.filter((item) => item.product.artId !== productId));
        this.saveCartToStorage();
    }

    updateQuantity(productId: number, quantity: number) {
        const currentItems = this.cartItems.value;
        const item = currentItems.find((item) => item.product.artId === productId);
        if (item) {
            item.quantity = quantity;
            this.cartItems.next(currentItems);
            this.saveCartToStorage();
        }
    }

    clearCart() {
        this.cartItems.next([]);
        this.saveCartToStorage();
    }

    getCartTotal(): number {
        return this.cartItems.value.reduce((total, item) => {
            return total + item.product.artPrixVente * item.quantity;
        }, 0);
    }

    getCartItemCount(): number {
        return this.cartItems.value.reduce((total, item) => total + item.quantity, 0);
    }

    private saveCartToStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    }
}
