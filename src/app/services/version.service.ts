import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AppVersion } from '../../models/list.model';
import { HttpService } from './http.service';

@Injectable({ providedIn: 'root' })
export class VersionService {
	constructor(private http: HttpService) {}

	getVersions(): Observable<AppVersion[]> {
		return this.http.get<AppVersion[]>('/version');
	}
}
