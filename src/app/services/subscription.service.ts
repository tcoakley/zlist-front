import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpService } from './http.service';

export interface SelectionListItem {
	id: number;
	listName: string;
	totalItems: number;
	isArchived: boolean;
}

export interface SelectionStatus {
	needsSelection: boolean;
	lists: SelectionListItem[];
	allowedCount: number;
}

export interface SubscriptionStatus {
	subscription: string;
	subscriptionSource: string;
	expiresAt?: string;
	gracePeriodUntil?: string;
	isPremium: boolean;
	isSponsored: boolean;
	ownedListCount: number;
	ownedListLimit: number;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
	private base = '/api/subscription';

	constructor(private http: HttpService) {}

	getStatus(): Observable<SubscriptionStatus> {
		return this.http.get<SubscriptionStatus>(`${this.base}/status`);
	}

	checkNeedsSelection(): Observable<SelectionStatus> {
		return this.http.get<SelectionStatus>(`${this.base}/needs-selection`);
	}

	selectLists(keepListIds: number[]): Observable<boolean> {
		return this.http.post<boolean>(`${this.base}/select-lists`, { keepListIds });
	}
}
