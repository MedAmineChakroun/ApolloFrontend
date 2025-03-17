import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserState } from './user.reducers';

export const selectUserState = createFeatureSelector<UserState>('user');

// Select the user object
export const selectUser = createSelector(selectUserState, (state) => state.user);

// Select specific user attributes
export const selectUserId = createSelector(selectUser, (user) => user?.id);
export const selectUserName = createSelector(selectUser, (user) => user?.userName);
export const selectUserEmail = createSelector(selectUser, (user) => user?.email);
