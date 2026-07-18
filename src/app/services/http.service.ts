import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError, of, TimeoutError } from 'rxjs';
import { catchError, switchMap, map, finalize, shareReplay, timeout } from 'rxjs/operators';
import { UserModel } from "../../models/user.model";
import { Result } from "../../models/result.model";
import { environment } from '../../environments/environment';

@Injectable({
	providedIn: 'root'
})
export class HttpService {
	private baseUrl: string = environment.apiUrl;

	constructor(
		private http: HttpClient,
		private router: Router
	) {}

	private getAuthHeaders(): HttpHeaders {
		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		return token
			? new HttpHeaders({ Authorization: `Bearer ${token}` })
			: new HttpHeaders();
	}

	private getJsonHeaders(): HttpHeaders {
		return this.getAuthHeaders().set('Content-Type', 'application/json');
	}

	private static readonly REQUEST_TIMEOUT_MS = 15000;

	get<T>(url: string): Observable<T> {
		return this.http.get<Result<T>>(`${this.baseUrl}${url}`, {
			headers: this.getAuthHeaders()
		}).pipe(
			timeout(HttpService.REQUEST_TIMEOUT_MS),
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleTimeoutOrAuthError(() => this.get<T>(url), error))
		);
	}

	post<T>(url: string, body: any): Observable<T> {
		return this.http.post<Result<T>>(`${this.baseUrl}${url}`, body, {
			headers: this.getJsonHeaders()
		}).pipe(
			timeout(HttpService.REQUEST_TIMEOUT_MS),
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleTimeoutOrAuthError(() => this.post<T>(url, body), error))
		);
	}

	put<T>(url: string, body: any): Observable<T> {
		return this.http.put<Result<T>>(`${this.baseUrl}${url}`, body, {
			headers: this.getJsonHeaders()
		}).pipe(
			timeout(HttpService.REQUEST_TIMEOUT_MS),
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleTimeoutOrAuthError(() => this.put<T>(url, body), error))
		);
	}

	delete<T>(url: string): Observable<T> {
		return this.http.delete<Result<T>>(`${this.baseUrl}${url}`, {
			headers: this.getAuthHeaders()
		}).pipe(
			timeout(HttpService.REQUEST_TIMEOUT_MS),
			map(response => this.unwrapResult<T>(response)),
			catchError(error => this.handleTimeoutOrAuthError(() => this.delete<T>(url), error))
		);
	}

	private unwrapResult<T>(response: Result<T>): T {
		if (!response.success) {
			throw new Error(response.message || 'An unknown error occurred.');
		}
		return response.model;
	}

	private handleTimeoutOrAuthError<T>(retryFn: () => Observable<T>, error: any): Observable<T> {
		if (error instanceof TimeoutError) {
			return throwError(() => new Error('Check your connection and try again.'));
		}
		return this.handleAuthError(retryFn, error);
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
						// Refresh failed, redirect to login preserving the current URL
						this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
						return throwError(() => error);
					}
				})
			);
		}
		return throwError(() => error);
	}

	private refreshInProgress$: Observable<string | null> | null = null;

	refreshAccessToken(): Observable<string | null> {
		// If a refresh is already in flight, share its real result instead of assuming
		// this concurrent caller's refresh "failed" — multiple 401s often arrive at once
		// (e.g. parallel page-load requests after a stale JWT), and only one should
		// actually hit the network; the rest should wait for and reuse its outcome.
		if (this.refreshInProgress$) return this.refreshInProgress$;

		this.refreshInProgress$ = this.http.post<Result<{ token: string }>>(
			`${this.baseUrl}/api/login/refresh`,
			{},
			{ withCredentials: true }
		).pipe(
			timeout(HttpService.REQUEST_TIMEOUT_MS),
			map(response => {
				const newToken = response.model.token;
				if (localStorage.getItem('authToken')) {
					localStorage.setItem('authToken', newToken);
				} else {
					sessionStorage.setItem('authToken', newToken);
				}
				return newToken;
			}),
			catchError(() => of(null)),
			finalize(() => { this.refreshInProgress$ = null; }),
			shareReplay(1)
		);

		return this.refreshInProgress$;
	}

}
