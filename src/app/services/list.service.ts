import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { List, ListItem, ListRun } from '../../models/list.model';
import { Observable } from 'rxjs';
import { Result } from '../../models/result.model';
import { map } from 'rxjs/operators';


@Injectable({
	providedIn: 'root'
})
export class ListService {
	private apiUrl = 'https://localhost:7224/api/lists';

	constructor(private http: HttpClient) {}

	getLists(): Observable<List[]> {
		return this.http.get<List[]>(`${this.apiUrl}/GetLists`);
	}

	addList(list: List): Observable<List> {
		return this.http.post<Result<List>>(`${this.apiUrl}/AddList`, list)
			.pipe(map(result => result.model!));
	}

	editList(list: List): Observable<List> {
		return this.http.put<Result<List>>(`${this.apiUrl}/EditList`, list)
			.pipe(map(result => result.model!));
	}

	deleteList(listId: number): Observable<boolean> {
		return this.http.delete<Result<boolean>>(`${this.apiUrl}/DeleteList/${listId}`)
			.pipe(map(result => result.model!));
	}

	addListItem(item: ListItem): Observable<ListItem> {
		return this.http.post<Result<ListItem>>(`${this.apiUrl}/AddListItem`, item)
			.pipe(map(result => result.model!));
	}

	editListItem(item: ListItem): Observable<ListItem> {
		return this.http.put<Result<ListItem>>(`${this.apiUrl}/EditListItem`, item)
			.pipe(map(result => result.model!));
	}

	deleteListItem(itemId: number): Observable<boolean> {
		return this.http.delete<Result<boolean>>(`${this.apiUrl}/DeleteListItem/${itemId}`)
			.pipe(map(result => result.model!));
	}

	createListRun(listId: number): Observable<ListRun> {
		return this.http.post<Result<ListRun>>(`${this.apiUrl}/CreateListRun/${listId}`, {})
			.pipe(map(result => result.model!));
	}
}
