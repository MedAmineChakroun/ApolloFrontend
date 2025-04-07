import { createAction, props } from '@ngrx/store';
import { CartItem } from '../../models/cart-item';

export const addToCart = createAction('[Cart] Add Item', props<{ item: CartItem }>());

export const removeFromCart = createAction('[Cart] Remove Item', props<{ productId: number }>());

export const updateQuantity = createAction('[Cart] Update Quantity', props<{ productId: number; quantity: number }>());

export const clearCart = createAction('[Cart] Clear Cart');

export const setCartItems = createAction('[Cart] Set Items', props<{ items: CartItem[] }>());
