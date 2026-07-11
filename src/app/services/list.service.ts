import { Injectable } from '@angular/core';
import { Observable, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { List, ListItem, ListInvitationInfo, ListMember, ListPendingInvite, ListRun, ListRunItem, RunHistorySummary, InviteResult, UserPendingInvitation } from '../../models/list.model';
import { HttpService } from './http.service';

@Injectable({
	providedIn: 'root'
})
export class ListService {
	private base = '/api/lists';

	constructor(private http: HttpService) {}

	getLists(): Observable<List[]> {
		return this.http.get<List[]>(`${this.base}/GetLists`);
	}

	getList(listId: number): Observable<List> {
		return this.http.get<List>(`${this.base}/GetList/${listId}`);
	}

	addList(list: List): Observable<List> {
		return this.http.post<List>(`${this.base}/AddList`, list);
	}

	editList(list: List): Observable<boolean> {
		return this.http.put<boolean>(`${this.base}/EditList`, list);
	}

	deleteList(listId: number): Observable<boolean> {
		return this.http.delete<boolean>(`${this.base}/DeleteList/${listId}`);
	}

	addListItem(item: ListItem): Observable<ListItem> {
		return this.http.post<ListItem>(`${this.base}/AddListItem`, item);
	}

	editListItem(item: ListItem): Observable<boolean> {
		return this.http.put<boolean>(`${this.base}/EditListItem`, item);
	}

	deleteListItem(itemId: number): Observable<boolean> {
		return this.http.delete<boolean>(`${this.base}/DeleteListItem/${itemId}`);
	}

	getListRun(runId: number): Observable<ListRun> {
		return this.http.get<ListRun>(`${this.base}/GetListRun/${runId}`);
	}

	createListRun(listId: number): Observable<ListRun> {
		return this.http.post<ListRun>(`${this.base}/CreateListRun/${listId}`, {}).pipe(
			timeout(12000),
			catchError(err => {
				if (err instanceof TimeoutError) {
					throw new Error('Check your connection and try again.');
				}
				throw err;
			})
		);
	}

	setListRunItemCompletion(runItemId: number, runId: number, isComplete: boolean): Observable<boolean> {
		return this.http.put<boolean>(`${this.base}/SetListRunItemCompletion/${runItemId}`, { runId, isComplete });
	}

	completeListRun(runId: number): Observable<boolean> {
		return this.http.put<boolean>(`${this.base}/CompleteListRun/${runId}`, {});
	}

	addRunItem(listRunId: number, listId: number, itemName: string, oneTime: boolean): Observable<ListRunItem> {
		return this.http.post<ListRunItem>(`${this.base}/AddRunItem`, { listRunId, listId, itemName, oneTime });
	}

	getListRunHistory(listId: number): Observable<RunHistorySummary[]> {
		return this.http.get<RunHistorySummary[]>(`${this.base}/GetListRunHistory/${listId}`);
	}

	// ─── Shared list methods ────────────────────────────────────────────────────

	getKnownCollaborators(): Observable<ListMember[]> {
		return this.http.get<ListMember[]>(`${this.base}/collaborators`);
	}

	getListMembers(listId: number): Observable<ListMember[]> {
		return this.http.get<ListMember[]>(`${this.base}/${listId}/members`);
	}

	getPendingInvitations(listId: number): Observable<ListPendingInvite[]> {
		return this.http.get<ListPendingInvite[]>(`${this.base}/${listId}/invitations`);
	}

	inviteToList(listId: number, email: string, sponsorConfirmed?: boolean): Observable<InviteResult> {
		return this.http.post<InviteResult>(`${this.base}/${listId}/invite`, { email, sponsorConfirmed });
	}

	removeListMember(listId: number, memberId: number): Observable<boolean> {
		return this.http.delete<boolean>(`${this.base}/${listId}/members/${memberId}`);
	}

	leaveList(listId: number): Observable<boolean> {
		return this.http.delete<boolean>(`${this.base}/${listId}/leave`);
	}

	getInvitation(token: string): Observable<ListInvitationInfo> {
		return this.http.get<ListInvitationInfo>(`/api/invite/${token}`);
	}

	acceptInvitation(token: string): Observable<boolean> {
		return this.http.post<boolean>(`/api/invite/${token}/accept`, {});
	}

	getMyPendingInvitations(): Observable<UserPendingInvitation[]> {
		return this.http.get<UserPendingInvitation[]>('/api/invite/pending');
	}

	declineInvitation(token: string): Observable<boolean> {
		return this.http.delete<boolean>(`/api/invite/${token}`);
	}
}
