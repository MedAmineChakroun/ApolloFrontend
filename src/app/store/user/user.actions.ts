import { createAction, props } from '@ngrx/store';
import { User } from '../../models/user';

// Set user (e.g., after login)
export const setUser = createAction('[User] Set User', props<{ user: User }>());

// Update user (e.g., after profile edit)
export const updateUser = createAction('[User] Update User', props<{ user: Partial<User> }>());

// Clear user (e.g., after logout)
export const clearUser = createAction('[User] Clear User');
