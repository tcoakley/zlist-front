import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { UserModel } from "../../models/user.model";

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = 'https://localhost:7224/api'; // Base API URL

	// ✅ Reactive auth state
	private isLoggedInSubject = new BehaviorSubject<boolean>(!!localStorage.getItem('authToken'));
	isLoggedIn$ = this.isLoggedInSubject.asObservable(); // ✅ Subscribe to this in components

	constructor(private http: HttpClient) {}

	// Check if the user is authenticated (use BehaviorSubject instead)
	isAuthenticated(): boolean {
		return this.isLoggedInSubject.value;
	}

	// Login method
	login(email: string, password: string): Observable<{ token: string }> {
		return new Observable(observer => {
			this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).subscribe(
				response => {
					localStorage.setItem('authToken', response.token);
					this.isLoggedInSubject.next(true); // ✅ Update authentication state
					observer.next(response);
					observer.complete();
				},
				error => observer.error(error)
			);
		});
	}

	// Signup method
	signUp(user: UserModel): Observable<any> {
		return this.http.post(`${this.apiUrl}/users/AddUser`, user);
	}

	// Update user account
	updateAccount(email: string, newEmail: string): Observable<any> {
		return this.http.put(`${this.apiUrl}/users/${email}`, { email: newEmail });
	}

	// Logout method
	logout(): void {
		localStorage.removeItem('authToken');
		this.isLoggedInSubject.next(false); // ✅ Ensure components update
	}
}
