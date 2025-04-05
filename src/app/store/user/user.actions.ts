import { createAction, props } from '@ngrx/store';
import { Client } from '../../models/Client';

// Set client (e.g., after login)
export const setUser = createAction('[User] Set User', props<{ client: Client }>());

// Update client (e.g., after profile edit)
export const updateUser = createAction('[User] Update User', props<{ client: Partial<Client> }>());

// Clear client (e.g., after logout)
export const clearUser = createAction('[User] Clear User');
