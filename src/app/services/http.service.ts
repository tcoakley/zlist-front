import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import { UserModel } from "../../models/user.model";
import { Result } from "../../models/result.model";
import { map } from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})
export class HttpService {
	private baseUrl: string = "https://localhost:7224";

	constructor(
		private http: HttpClient,
		private router: Router
	) {}

	private getAuthHeaders(): HttpHeaders {
		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		return token ? new HttpHeaders({ Authorization: `Bearer ${token}` }) : new HttpHeaders();
	}

	get<T>(url: string): Observable<T> {
		return this.http.get<any>(`${this.baseUrl}${url}`, { headers: this.getAuthHeaders() }).pipe(
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleAuthError(() => this.get<T>(url), error))
		);
	}
	
	post<T>(url: string, body: any): Observable<T> {
		return this.http.post<any>(`${this.baseUrl}${url}`, body, { headers: this.getAuthHeaders() }).pipe(
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleAuthError(() => this.post<T>(url, body), error))
		);
	}
	
	put<T>(url: string, body: any): Observable<T> {
		return this.http.put<any>(`${this.baseUrl}${url}`, body, { headers: this.getAuthHeaders() }).pipe(
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleAuthError(() => this.put<T>(url, body), error))
		);
	}
	
	private unwrapResult<T>(response: any): T {
		if (response && typeof response === 'object' && 'success' in response && 'model' in response) {
			if (!response.success) {
				throw new Error(response.message || 'An unknown error occurred.');
			}
			return response.model as T;
		}
		return response as T;
	}		

	private tryAutoLogin(): Observable<boolean> {
		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		if (!token) {
			return of(false);
		}
	
		const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });
	
		return this.http.get<UserModel>(`${this.baseUrl}/api/users/GetUserProfile`, { headers }).pipe(
			map(user => {
				// Optional: store user somewhere if needed
				return true;
			}),
			catchError(() => of(false))
		);
	}

	private handleAuthError<T>(retryFn: () => Observable<T>, error: HttpErrorResponse): Observable<T> {
		console.log("error.status", error.status);
		if (error.status === 401) {
			const token = localStorage.getItem('authToken');
			console.log("token", token);
			if (token) {
				return this.tryAutoLogin().pipe(
					switchMap(success => {
						console.log("success", success);
						if (success) {
							return retryFn();
						} else {
							this.router.navigate(['/login'], { queryParams: { message: 'Session expired' } });
							return throwError(() => error);
						}
					})
				);
			} else {
				this.router.navigate(['/login'], { queryParams: { message: 'Please log in' } });
			}
		}
		return throwError(() => error);
	}
}
