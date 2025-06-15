import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import * as UserActions from './user.actions';
import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { catchError, map, mergeMap, of, tap } from 'rxjs';

@Injectable()
export class UserEffects {
	private actions$ = inject(Actions);
	private authService = inject(AuthService);
	private userService = inject(UserService);

	login$ = createEffect(() =>
		this.actions$.pipe(
			ofType(UserActions.login),
			mergeMap(({ email, password, rememberMe }) =>
				this.authService.login(email, password).pipe(
					map(({ user, token }) => UserActions.loginSuccess({ user, token, rememberMe })),
					catchError((error) => of(UserActions.loginFailure({ error })))
				)
			)
		)
	);

	loginSuccess$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(UserActions.loginSuccess),
				tap(({ token, rememberMe }) => {
					if (rememberMe) {
						localStorage.setItem('authToken', token);
					} else {
						sessionStorage.setItem('authToken', token);
					}
				})
			),
		{ dispatch: false }
	);

	loginWithToken$ = createEffect(() =>
		this.actions$.pipe(
			ofType(UserActions.loginWithToken),
			mergeMap(({ token }) =>
				this.authService.loginWithToken(token).pipe(
					map((user) => UserActions.loginSuccess({ user, token, rememberMe: true })),
					catchError((error) => of(UserActions.loginFailure({ error })))
				)
			)
		)
	);

	logout$ = createEffect(
		() =>
			this.actions$.pipe(
				ofType(UserActions.logout),
				tap(() => this.authService.logout())
			),
		{ dispatch: false }
	);

	loadUserProfile$ = createEffect(() =>
		this.actions$.pipe(
			ofType(UserActions.loadUserProfile),
			mergeMap(() =>
				this.userService.getUserProfile().pipe(
					map((user) => UserActions.loadUserProfileSuccess({ user })),
					catchError((error) => of(UserActions.loadUserProfileFailure({ error })))
				)
			)
		)
	);

	updateUser$ = createEffect(() =>
		this.actions$.pipe(
			ofType(UserActions.updateUser),
			mergeMap(({ user }) =>
				this.userService.updateUserProfile(user).pipe(
					map((updatedUser) => UserActions.updateUserSuccess({ user: updatedUser })),
					catchError((error) => of(UserActions.updateUserFailure({ error })))
				)
			)
		)
	);

	signUp$ = createEffect(() =>
		this.actions$.pipe(
			ofType(UserActions.signUp),
			mergeMap(({ user }) =>
				this.authService.signUp(user).pipe(
					map(() => UserActions.signUpSuccess()),
					catchError((error) => of(UserActions.signUpFailure({ error })))
				)
			)
		)
	);
}
