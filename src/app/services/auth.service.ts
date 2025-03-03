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
	isLoggedIn$ = this.isLoggedInSubject.asObservable(); 

	constructor(private http: HttpClient) {}

	isAuthenticated(): boolean {
		return this.isLoggedInSubject.value;
	}

	login(email: string, password: string): Observable<{ token: string }> {
		return new Observable(observer => {
			this.http.post<{ token: string }>(`${this.apiUrl}/login`, { email, password }).subscribe(
				response => {
					this.isLoggedInSubject.next(true); 
					observer.next(response);
					observer.complete();
				},
				error => observer.error(error)
			);
		});
	}

	loginWithToken(token: string) {
		localStorage.setItem('authToken', token); 
		this.isLoggedInSubject.next(true);
	}

	logout() {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
		this.isLoggedInSubject.next(false); 
	}

	signUp(user: UserModel): Observable<any> {
		return this.http.post(`${this.apiUrl}/users/AddUser`, user);
	}

	updateUser(user: UserModel): Observable<any> {
		return this.http.put(`${this.apiUrl}/users/UpdateUser`, user);
	}
}
