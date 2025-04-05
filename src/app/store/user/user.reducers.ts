//nesta3mlou elel actions eli declarinehom

import { createReducer, on } from '@ngrx/store';
import { setUser, updateUser, clearUser } from './user.actions';
import { Client } from '../../models/Client';

// Define initial state
export interface UserState {
    client: Client | null;
}

export const initialState: UserState = {
    client: null
};

// Create reducer function
export const userReducer = createReducer(
    initialState,

    on(setUser, (state, { client }) => ({ ...state, client })),

    on(updateUser, (state, { client }) => ({
        ...state,
        client: { ...state.client, ...client } as Client
    })),

    on(clearUser, () => ({ client: null }))
);
