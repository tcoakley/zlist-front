import { createReducer, on } from '@ngrx/store';
import * as UserActions from './user.actions';
import { UserModel } from '../../../models/user.model';

export interface UserState {
	user: UserModel | null;
	loading: boolean;
	error: any;
	authInitialized: boolean; 
}

export const initialState: UserState = {
	user: null,
	loading: false,
	error: null,
	authInitialized: false
};

export const userReducer = createReducer(
	initialState,

	on(UserActions.login, UserActions.loginWithToken, UserActions.loadUserProfile, (state) => ({
		...state,
		loading: true,
		error: null
	})),

	on(UserActions.loginSuccess, UserActions.loadUserProfileSuccess, (state, { user }) => ({
		...state,
		user,
		loading: false,
		authInitialized: true 
	})),

	on(UserActions.loginFailure, UserActions.loadUserProfileFailure, (state, { error }) => ({
		...state,
		loading: false,
		error,
		authInitialized: true 
	})),

	on(UserActions.logout, () => ({
		...initialState,
		authInitialized: true 
	})),

	on(UserActions.updateUserSuccess, (state, { user }) => ({
		...state,
		user
	}))
);
