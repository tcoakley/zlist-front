import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { UserModel } from '../../../models/user.model';
import { AuthService } from '../../services/auth.service';
import { HttpService } from '../../services/http.service';
import { UserService } from '../../services/user.service';
import { SubscriptionService } from '../../services/subscription.service';

@Injectable({ providedIn: 'root' })
export class UserStore {
	private authService = inject(AuthService);
	private httpService = inject(HttpService);
	private userService = inject(UserService);
	private subscriptionService = inject(SubscriptionService);

	readonly user = signal<UserModel | null>(null);
	readonly loading = signal(false);
	readonly error = signal<any>(null);
	readonly authInitialized = signal(false);
	readonly isLoggedIn = computed(() => !!this.user());
	readonly isPremium = computed(() => this.user()?.isPremium === true);
	readonly isAdmin = computed(() => this.user()?.isAdmin === true);
	readonly needsDowngradeSelection = signal(false);

	async login(email: string, password: string, rememberMe: boolean): Promise<void> {
		this.loading.set(true);
		this.error.set(null);
		try {
			const { user, token } = await firstValueFrom(this.authService.login(email, password, rememberMe));
			if (rememberMe) {
				localStorage.setItem('authToken', token);
			} else {
				sessionStorage.setItem('authToken', token);
			}
			this.user.set(user);
			await this.checkDowngradeSelection();
			this.authInitialized.set(true);
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			this.authInitialized.set(true);
		} finally {
			this.loading.set(false);
		}
	}

	// Called once on app startup. If no access token is cached locally (e.g. "remember me" was off
	// and the browser was closed), the refresh cookie is still valid for up to 5 years regardless —
	// try it before giving up, so a device only ever has to log in once.
	async tryRestoreSession(): Promise<void> {
		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		if (token) {
			await this.loginWithToken(token);
			return;
		}

		const refreshedToken = await firstValueFrom(this.httpService.refreshAccessToken());
		if (refreshedToken) {
			localStorage.setItem('authToken', refreshedToken);
			await this.loginWithToken(refreshedToken);
		} else {
			this.markAuthInitialized();
		}
	}

	async loginWithToken(token: string): Promise<void> {
		this.loading.set(true);
		try {
			const user = await firstValueFrom(this.authService.loginWithToken(token));
			this.user.set(user);
			await this.checkDowngradeSelection();
		} catch {
			localStorage.removeItem('authToken');
			sessionStorage.removeItem('authToken');
		} finally {
			this.authInitialized.set(true);
			this.loading.set(false);
		}
	}

	async checkDowngradeSelection(): Promise<void> {
		try {
			const status = await firstValueFrom(this.subscriptionService.checkNeedsSelection());
			this.needsDowngradeSelection.set(status.needsSelection);
		} catch {
			// non-fatal; default stays false
		}
	}

	markAuthInitialized(): void {
		this.authInitialized.set(true);
	}

	logout(): void {
		this.authService.logout();
		this.user.set(null);
		this.error.set(null);
		this.authInitialized.set(true);
	}

	clearError(): void {
		this.error.set(null);
	}

	async updateUser(user: UserModel): Promise<boolean> {
		this.loading.set(true);
		this.error.set(null);
		try {
			const updated = await firstValueFrom(this.userService.updateUserProfile(user));
			this.user.set(updated);
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		} finally {
			this.loading.set(false);
		}
	}

	async refreshUser(): Promise<void> {
		try {
			const user = await firstValueFrom(this.userService.getUserProfile());
			this.user.set(user);
		} catch {
			// non-fatal
		}
	}

	async signUp(user: UserModel): Promise<boolean> {
		this.loading.set(true);
		this.error.set(null);
		try {
			await firstValueFrom(this.authService.signUp(user));
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		} finally {
			this.loading.set(false);
		}
	}
}
