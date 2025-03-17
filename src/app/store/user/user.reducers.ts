//nesta3mlou elel actions eli declarinehom

import { createReducer, on } from '@ngrx/store';
import { setUser, updateUser, clearUser } from './user.actions';
import { User } from '../../models/user';

// Define initial state
export interface UserState {
    user: User | null;
}

export const initialState: UserState = {
    user: null
};

// Create reducer function
export const userReducer = createReducer(
    initialState,

    on(setUser, (state, { user }) => ({ ...state, user })),

    on(updateUser, (state, { user }) => ({
        ...state,
        user: { ...state.user, ...user } as User
    })),

    on(clearUser, () => ({ user: null }))
);
