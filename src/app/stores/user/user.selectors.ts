import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UserState } from './user.reducer';

export const selectUserState = createFeatureSelector<UserState>('user');

export const selectCurrentUser = createSelector(
	selectUserState,
	(state) => state.user
);

export const selectIsLoading = createSelector(
	selectUserState,
	(state) => state.loading
);

export const selectUserError = createSelector(
	selectUserState,
	(state) => state.error
);

export const selectAuthInitialized = createSelector(
	selectUserState,
	(state: UserState) => state.authInitialized
);

export const selectIsLoggedIn = createSelector(
	selectCurrentUser,
	user => !!user
);
