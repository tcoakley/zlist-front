import { createAction, props } from '@ngrx/store';
import { UserModel } from '../../../models/user.model';

export const login = createAction(
	'[User] Login',
	props<{ email: string; password: string; rememberMe: boolean }>()
);

export const loginSuccess = createAction(
	'[User] Login Success',
	props<{ user: UserModel; token: string; rememberMe: boolean }>()
);

export const loginFailure = createAction(
	'[User] Login Failure',
	props<{ error: any }>()
);

export const loginWithToken = createAction(
	'[User] Login With Token',
	props<{ token: string }>()
);

export const logout = createAction('[User] Logout');

export const loadUserProfile = createAction('[User] Load User Profile');
export const loadUserProfileSuccess = createAction('[User] Load User Profile Success', props<{ user: UserModel }>());
export const loadUserProfileFailure = createAction('[User] Load User Profile Failure', props<{ error: any }>());

export const updateUser = createAction('[User] Update User', props<{ user: UserModel }>());
export const updateUserSuccess = createAction('[User] Update User Success', props<{ user: UserModel }>());
export const updateUserFailure = createAction('[User] Update User Failure', props<{ error: any }>());

export const signUp = createAction(
	'[User] Sign Up',
	props<{ user: UserModel }>()
);

export const signUpSuccess = createAction('[User] Sign Up Success');

export const signUpFailure = createAction(
	'[User] Sign Up Failure',
	props<{ error: any }>()
);
