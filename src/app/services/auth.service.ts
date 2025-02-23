import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from "../../models/user.model";

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = 'https://localhost:7224/api';
	private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('authToken') || !!sessionStorage.getItem('authToken'));
	isLoggedIn$ = this.isLoggedInSubject.asObservable(); // ✅ Reactive authentication

	constructor(private http: HttpClient) {}

	isAuthenticated(): boolean {
		return this.isLoggedInSubject.value;
	}

	login(email: string, password: string): Observable<{ token: string }> {
		return new Observable(observer => {
			this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).subscribe(
				response => {
					this.isLoggedInSubject.next(true); // ✅ Update login state
					observer.next(response);
					observer.complete();
				},
				error => observer.error(error)
			);
		});
	}

	// ✅ Allow users to log in using a stored token
	loginWithToken(token: string) {
		localStorage.setItem('authToken', token); // ✅ Store token
		this.isLoggedInSubject.next(true);
	}

	logout() {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
		this.isLoggedInSubject.next(false); // ✅ Logout updates UI
	}

	signUp(user: UserModel): Observable<any> {
		return this.http.post(`${this.apiUrl}/users/AddUser`, user);
	}

	updateAccount(email: string, newEmail: string): Observable<any> {
		return this.http.put(`${this.apiUrl}/users/${email}`, { email: newEmail });
	}
}
