import { createSelector, createFeatureSelector } from '@ngrx/store';
import { UserState } from './user.reducers';

export const selectUserState = createFeatureSelector<UserState>('user');

// Select the client object
export const selectUser = createSelector(selectUserState, (state) => state.client);

// Select specific client attributes
export const selectUserId = createSelector(selectUser, (client) => client?.tiersId);
export const selectUserName = createSelector(selectUser, (client) => client?.tiersIntitule);
export const selectUserEmail = createSelector(selectUser, (client) => client?.tiersCode);
export const selectUserAdresse = createSelector(selectUser, (client) => client?.tiersAdresse1);
export const selectUserCodePostal = createSelector(selectUser, (client) => client?.tiersCodePostal);
export const selectUserVille = createSelector(selectUser, (client) => client?.tiersVille);
export const selectUserPays = createSelector(selectUser, (client) => client?.tiersPays);
export const selectUserTel = createSelector(selectUser, (client) => client?.tiersTel1);
