import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { UserModel } from '../../models/user.model';
import { HttpService } from '../services/http.service';

@Injectable({ providedIn: 'root' })
export class AuthService {
	constructor(private http: HttpService) {}

	login(email: string, password: string, rememberMe: boolean): Observable<{ token: string; user: UserModel }> {
		return this.http.post<{ token: string; user: UserModel }>('/api/login', { email, password, rememberMe });
	}

	loginWithToken(token: string): Observable<UserModel> {
		this.setToken(token);
		return this.http.get<UserModel>('/api/users/GetUserProfile');
	}

	logout(): void {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
	}

	signUp(user: UserModel): Observable<void> {
		return this.http.post<void>('/api/users/AddUser', user);
	}

	forgotPassword(email: string): Observable<string> {
		return this.http.post<string>('/api/login/forgotPassword', { email }).pipe(
			map(response => response ?? 'Reset email sent successfully.'),
			catchError(err => {
				console.error('Forgot password error:', err);
				throw err;
			})
		);
	}

	setToken(token: string): void {
		localStorage.setItem('authToken', token);
	}
}
