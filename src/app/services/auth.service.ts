import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from "../../models/user.model";

@Injectable({
	providedIn: 'root',
})
export class AuthService {
	private apiUrl = 'https://localhost:7224/api'; // Base API URL

	constructor(private http: HttpClient) {}

	// Check if the user is authenticated
	isAuthenticated(): boolean {
		return !!localStorage.getItem('authToken');
	}

	// Login method
	login(email: string, password: string): Observable<{ token: string }> {
		return this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password });
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
	}
}
