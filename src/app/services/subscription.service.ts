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
	cancellationScheduledAt?: string;
	isPremium: boolean;
	isSponsored: boolean;
	sponsorName?: string;
	ownedListCount: number;
	ownedListLimit: number;
}

export interface SponsoredCollaborator {
	userId: number;
	email: string;
	firstName?: string;
	lastName?: string;
	createdAt: string;
	isActive: boolean;
	graceUntil?: string;
	isFreeSeat: boolean;
}

export interface PendingSponsorInvitation {
	id: number;
	invitedEmail: string;
	createdAt: string;
	expiresAt: string;
}

export interface CollaboratorCheck {
	exists: boolean;
	isPremium: boolean;
	premiumSource?: string;
	isAlreadyYourCollaborator: boolean;
	isAlreadySponsoredByOther: boolean;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionService {
	private base = '/api/subscription';

	constructor(private http: HttpService) {}

	getStatus(): Observable<SubscriptionStatus> {
		return this.http.get<SubscriptionStatus>(`${this.base}/status`);
	}

	upgrade(): Observable<{ clientSecret: string; subscriptionId: string }> {
		return this.http.post<{ clientSecret: string; subscriptionId: string }>(`${this.base}/upgrade`, {});
	}

	cancelSubscription(): Observable<boolean> {
		return this.http.post<boolean>(`${this.base}/cancel`, {});
	}

	getCollaborators(): Observable<SponsoredCollaborator[]> {
		return this.http.get<SponsoredCollaborator[]>(`${this.base}/collaborators`);
	}

	addCollaborator(email: string): Observable<boolean> {
		return this.http.post<boolean>(`${this.base}/collaborators`, { email });
	}

	removeCollaborator(userId: number): Observable<boolean> {
		return this.http.delete<boolean>(`${this.base}/collaborators/${userId}`);
	}

	getPendingInvitations(): Observable<PendingSponsorInvitation[]> {
		return this.http.get<PendingSponsorInvitation[]>(`${this.base}/collaborators/pending`);
	}

	cancelPendingInvitation(email: string): Observable<boolean> {
		return this.http.delete<boolean>(`${this.base}/collaborators/pending/${encodeURIComponent(email)}`);
	}

	checkCollaborator(email: string): Observable<CollaboratorCheck> {
		return this.http.get<CollaboratorCheck>(`${this.base}/collaborators/check?email=${encodeURIComponent(email)}`);
	}

	addPaidCollaborator(email: string): Observable<boolean> {
		return this.http.post<boolean>(`${this.base}/collaborators/paid`, { email });
	}

	checkNeedsSelection(): Observable<SelectionStatus> {
		return this.http.get<SelectionStatus>(`${this.base}/needs-selection`);
	}

	selectLists(keepListIds: number[]): Observable<boolean> {
		return this.http.post<boolean>(`${this.base}/select-lists`, { keepListIds });
	}

	adminGetStatus(email: string): Observable<SubscriptionStatus> {
		return this.http.get<SubscriptionStatus>(`${this.base}/admin/status?email=${encodeURIComponent(email)}`);
	}

	adminGrant(email: string, source: string, expiresAt?: string): Observable<boolean> {
		return this.http.post<boolean>(`${this.base}/admin/grant`, { email, source, expiresAt: expiresAt || null });
	}

	adminRevoke(email: string): Observable<boolean> {
		return this.http.post<boolean>(`${this.base}/admin/revoke`, { email });
	}
}
