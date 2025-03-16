import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { UserService } from '../services/user.service';
import { UserModel } from '../../models/user.model';

@Injectable({ providedIn: 'root' })
export class UserStore {
	private activeUser = new BehaviorSubject<UserModel | null>(null);
	user$ = this.activeUser.asObservable();

	constructor(private authService: AuthService, private userService: UserService) {
		const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		if (storedToken) {
			this.loginWithToken(storedToken).subscribe();
		}
	}
	

	setUser(user: UserModel): void {
		this.activeUser.next(user);
	}

	getUser(): UserModel | null {
		return this.activeUser.value;
	}

	fetchUserProfile(): void {
		this.userService.getUserProfile().subscribe(user => {
			this.setUser(user);
		});
	}

	login(email: string, password: string): Observable<{ token: string; user: UserModel }> {
		return new Observable(observer => {
			this.authService.login(email, password).subscribe(response => {
				const { token, user } = response;
				localStorage.setItem('authToken', token);
				this.setUser(user);
				observer.next(response);
				observer.complete();
			}, error => observer.error(error));
		});
	}

	loginWithToken(token: string): Observable<UserModel> {
		return new Observable(observer => {
			this.authService.loginWithToken(token).subscribe(user => {
				this.setUser(user);
				observer.next(user);
				observer.complete();
			}, error => observer.error(error));
		});
	}

	logout(): void {
		localStorage.removeItem('authToken');
		this.setUser({ id: 0, email: '', password: '', firstName: '', lastName: '' });
		this.authService.logout();
	}

	updateUser(user: UserModel): Observable<UserModel> {
		return new Observable(observer => {
			this.userService.updateUserProfile(user).subscribe(updatedUser => {
				this.setUser(updatedUser);
				observer.next(updatedUser);
				observer.complete();
			}, error => observer.error(error));
		});
	}
}
