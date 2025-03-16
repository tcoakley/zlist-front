import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from "../../models/user.model";
import { Result } from '../../models/result.model';

import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = 'https://localhost:7224/api';
	private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken'));
	isLoggedIn$ = this.isLoggedInSubject.asObservable(); 

	constructor(private http: HttpClient) {}

	isAuthenticated(): boolean {
		return this.isLoggedInSubject.value;
	}

	login(email: string, password: string): Observable<{ token: string; user: UserModel }> {
		return new Observable(observer => {
			this.http.post<{ token: string; user: UserModel }>(`${this.apiUrl}/login`, { email, password }).subscribe(
				response => {
					this.isLoggedInSubject.next(true); 
					observer.next(response);
					observer.complete();
				},
				error => observer.error(error)
			);
		});
	}

	loginWithToken(token: string): Observable<UserModel> {
		localStorage.setItem('authToken', token); 
		this.isLoggedInSubject.next(true);
		return this.http.get<UserModel>(`${this.apiUrl}/users/GetUserProfile`);
	}

	logout() {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
		this.isLoggedInSubject.next(false); 
	}

	signUp(user: UserModel): Observable<any> {
		return this.http.post(`${this.apiUrl}/users/AddUser`, user);
	}

	forgotPassword(email: string): Observable<string> {
		return this.http.post<{ success: boolean; message: string | null; model: string | null }>(
			`${this.apiUrl}/login/forgotPassword`,
			{ email }
		).pipe(
			map(response => {
				if (!response.success) {
					throw new Error(response.message || 'An unknown error occurred.');
				}
				return response.model || 'Request completed successfully.';
			})
		);
	}
}
