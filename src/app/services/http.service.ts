import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of } from 'rxjs';
import { catchError, switchMap, map } from 'rxjs/operators';
import { UserModel } from "../../models/user.model";
import { Result } from "../../models/result.model";

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
		return this.http.get<Result<T>>(`${this.baseUrl}${url}`, {
			headers: this.getAuthHeaders()
		}).pipe(
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleAuthError(() => this.get<T>(url), error))
		);
	}

	post<T>(url: string, body: any): Observable<T> {
		return this.http.post<Result<T>>(`${this.baseUrl}${url}`, body, {
			headers: this.getAuthHeaders()
		}).pipe(
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleAuthError(() => this.post<T>(url, body), error))
		);
	}

	put<T>(url: string, body: any): Observable<T> {
		return this.http.put<Result<T>>(`${this.baseUrl}${url}`, body, {
			headers: this.getAuthHeaders()
		}).pipe(
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleAuthError(() => this.put<T>(url, body), error))
		);
	}

	private unwrapResult<T>(response: Result<T>): T {
		if (!response.success) {
			throw new Error(response.message || 'An unknown error occurred.');
		}
		return response.model;
	}

	// private tryAutoLogin(): Observable<boolean> {
	// 	const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
	// 	if (!token) return of(false);

	// 	const headers = new HttpHeaders({ Authorization: `Bearer ${token}` });

	// 	return this.http.get<Result<UserModel>>(`${this.baseUrl}/api/users/GetUserProfile`, { headers }).pipe(
	// 		map(res => res.success),
	// 		catchError(() => of(false))
	// 	);
	// }

	private handleAuthError<T>(retryFn: () => Observable<T>, error: HttpErrorResponse): Observable<T> {
		if (error.status === 401) {
			return this.refreshAccessToken().pipe(
				switchMap(newToken => {
					if (newToken) {
						// Token refreshed! Retry the original request
						return retryFn();
					} else {
						// Refresh failed, redirect to login
						this.router.navigate(['/login'], { queryParams: { message: 'Session expired' } });
						return throwError(() => error);
					}
				})
			);
		}
		return throwError(() => error);
	}

	private refreshAccessToken(): Observable<string | null> {
		return this.http.post<{ result: { token: string } }>(
			`${this.baseUrl}/api/login/refresh`, 
			{}, 
			{ withCredentials: true } // This sends cookies!
		).pipe(
			map(response => {
				const newToken = response.result.token;
				// Save new token in storage
				localStorage.setItem('authToken', newToken);
				return newToken;
			}),
			catchError(() => of(null))
		);
	}

}
