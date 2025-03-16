import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserModel } from "../../models/user.model";
import { Result } from "../../models/result.model";

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = 'https://localhost:7224/api/users';

	constructor(private http: HttpClient) {}

	getUserProfile(): Observable<UserModel> {
		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);

		return this.http.get<UserModel>(`${this.apiUrl}/GetUserProfile`, { headers });
	}

	updateUserProfile(user: UserModel): Observable<UserModel> {
		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
		return new Observable(observer => {
			this.http.put<Result<UserModel>>(`${this.apiUrl}/UpdateUser`, user, { headers }).subscribe(response => {
				if (response.success) {
					observer.next(response.model);
					observer.complete();
				} else {
					observer.error(response.message);
				}
			}, error => observer.error(error));
		});
	}
}
