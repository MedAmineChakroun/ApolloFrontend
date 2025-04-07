import { createFeatureSelector, createSelector } from '@ngrx/store';
import { CartState } from './cart.reducers';

export const selectCartState = createFeatureSelector<CartState>('cart');

export const selectCartItems = createSelector(selectCartState, (state: CartState) => state?.items ?? []);

export const selectCartItemCount = createSelector(selectCartItems, (items) => items.reduce((total, item) => total + item.quantity, 0));

export const selectCartTotal = createSelector(selectCartItems, (items) => items.reduce((total, item) => total + item.product.artPrixVente * item.quantity, 0));
