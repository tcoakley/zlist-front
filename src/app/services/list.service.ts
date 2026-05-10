import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { List, ListItem, ListRun } from '../../models/list.model';
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
		return this.http.post<ListRun>(`${this.base}/CreateListRun/${listId}`, {});
	}

	setListRunItemCompletion(runItemId: number, isComplete: boolean): Observable<boolean> {
		return this.http.put<boolean>(`${this.base}/SetListRunItemCompletion/${runItemId}`, isComplete);
	}

	completeListRun(runId: number): Observable<boolean> {
		return this.http.put<boolean>(`${this.base}/CompleteListRun/${runId}`, {});
	}
}
