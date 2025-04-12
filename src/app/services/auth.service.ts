import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from "../../models/user.model";
import { Result } from '../../models/result.model';
import { HttpService } from "../services/http.service";

import { map } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = '/api';
	private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken'));
	isLoggedIn$ = this.isLoggedInSubject.asObservable(); 
	private currentUserSubject = new BehaviorSubject<UserModel | null>(null);
	currentUser$ = this.currentUserSubject.asObservable();
	
	constructor(private http: HttpService) {}

	isAuthenticated(): boolean {
		return this.isLoggedInSubject.value;
	}

	login(email: string, password: string): Observable<{ token: string; user: UserModel }> {
		return new Observable(observer => {
			this.http.post<{ token: string; user: UserModel }>('/api/login', { email, password }).subscribe(
				response => {
					console.log("response", response);
					this.isLoggedInSubject.next(true); 
					this.setUser(response.user);
					observer.next(response);
					observer.complete();
				},
				error => observer.error(error)
			);
		});
	}
	
	loginWithToken(token: string): Observable<UserModel> {
		this.setToken(token);
		this.isLoggedInSubject.next(true);
		return this.http.get<UserModel>('/api/users/GetUserProfile');
	}
	

	logout() {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
		this.isLoggedInSubject.next(false); 
	}

	signUp(user: UserModel): Observable<any> {
		return this.http.post('/api/users/AddUser', user);
	}
	
	forgotPassword(email: string): Observable<string> {
		return this.http.post<{ success: boolean; message: string | null; model: string | null }>(
			'/api/login/forgotPassword',
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
	

	autoLoginWithToken(token: string): Observable<boolean> {
		return new Observable<boolean>(observer => {
			this.getUserFromToken(token).subscribe(
				user => {
					this.setToken(token);
					this.setUser(user);
					observer.next(true);
					observer.complete();
				},
				() => {
					this.clearToken();
					observer.next(false);
					observer.complete();
				}
			);
		});
	}
	
	private getUserFromToken(token: string): Observable<UserModel> {
		this.setToken(token);
		return this.http.get<UserModel>('/api/users/GetUserProfile');
	}

	
	setToken(token: string) {
		localStorage.setItem('authToken', token);
	}
	
	private clearToken() {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
	}

	setUser(user: UserModel) {
		this.currentUserSubject.next(user);
	}
	
	getUser(): UserModel | null {
		return this.currentUserSubject.value;
	}
	
	
	
}
