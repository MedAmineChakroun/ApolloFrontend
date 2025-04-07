import { createReducer, on } from '@ngrx/store';
import * as CartActions from './cart.actions';
import { CartItem } from '../../models/cart-item';

export interface CartState {
    items: CartItem[];
}

export const initialState: CartState = {
    items: []
};

export const cartReducer = createReducer(
    initialState,
    on(CartActions.addToCart, (state, { item }) => ({
        ...state,
        items: [...state.items, item]
    })),
    on(CartActions.removeFromCart, (state, { productId }) => ({
        ...state,
        items: state.items.filter((item) => item.product.artId !== productId)
    })),
    on(CartActions.updateQuantity, (state, { productId, quantity }) => ({
        ...state,
        items: state.items.map((item) => (item.product.artId === productId ? { ...item, quantity } : item))
    })),
    on(CartActions.clearCart, (state) => ({
        ...state,
        items: []
    })),
    on(CartActions.setCartItems, (state, { items }) => ({
        ...state,
        items
    }))
);
