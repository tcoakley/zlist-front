import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserModel } from "../../models/user.model";
import { Result } from "../../models/result.model";
import { HttpService } from "../services/http.service";

@Injectable({
	providedIn: 'root',
})
export class UserService {
	private apiUrl = '/api/users';

	constructor(private http: HttpService) {}

	getUserProfile(): Observable<UserModel> {
		return this.http.get<UserModel>(`${this.apiUrl}/GetUserProfile`);
	}

	updateUserProfile(user: UserModel): Observable<UserModel> {
		return this.http.put<UserModel>(`${this.apiUrl}/UpdateUser`, user);
	}
}
