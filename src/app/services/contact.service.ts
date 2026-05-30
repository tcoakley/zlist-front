import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export interface ContactRequest {
	firstName: string;
	lastName: string;
	contactType: string;
	message: string;
}

@Injectable({ providedIn: 'root' })
export class ContactService {
	constructor(private http: HttpService) {}

	submit(request: ContactRequest): Observable<boolean> {
		return this.http.post<boolean>('/api/contact', request);
	}
}
