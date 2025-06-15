import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { ListService } from '../../services/list.service';
import * as ListActions from './list.actions';
import { catchError, map, mergeMap, of } from 'rxjs';

@Injectable()
export class ListEffects {
	constructor(
		private actions$: Actions,
		private listService: ListService
	) {}

	loadLists$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.loadLists),
			mergeMap(() =>
				this.listService.getLists().pipe(
					map(lists => ListActions.loadListsSuccess({ lists })),
					catchError(error => of(ListActions.loadListsFailure({ error })))
				)
			)
		)
	);

	addList$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.addList),
			mergeMap(({ list }) =>
				this.listService.addList(list).pipe(
					map(newList => ListActions.addListSuccess({ list: newList })),
					catchError(error => of(ListActions.addListFailure({ error })))
				)
			)
		)
	);

	editList$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.editList),
			mergeMap(({ list }) =>
				this.listService.editList(list).pipe(
					map(updatedList => ListActions.editListSuccess({ list: updatedList })),
					catchError(error => of(ListActions.editListFailure({ error })))
				)
			)
		)
	);

	deleteList$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.deleteList),
			mergeMap(({ listId }) =>
				this.listService.deleteList(listId).pipe(
					map(() => ListActions.deleteListSuccess({ listId })),
					catchError(error => of(ListActions.deleteListFailure({ error })))
				)
			)
		)
	);

	addListItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.addListItem),
			mergeMap(({ item }) =>
				this.listService.addListItem(item).pipe(
					map(newItem => ListActions.addListItemSuccess({ item: newItem })),
					catchError(error => of(ListActions.addListItemFailure({ error })))
				)
			)
		)
	);

	editListItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.editListItem),
			mergeMap(({ item }) =>
				this.listService.editListItem(item).pipe(
					map(updatedItem => ListActions.editListItemSuccess({ item: updatedItem })),
					catchError(error => of(ListActions.editListItemFailure({ error })))
				)
			)
		)
	);

	deleteListItem$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.deleteListItem),
			mergeMap(({ itemId }) =>
				this.listService.deleteListItem(itemId).pipe(
					map(() => ListActions.deleteListItemSuccess({ itemId })),
					catchError(error => of(ListActions.deleteListItemFailure({ error })))
				)
			)
		)
	);

	createListRun$ = createEffect(() =>
		this.actions$.pipe(
			ofType(ListActions.createListRun),
			mergeMap(({ listId }) =>
				this.listService.createListRun(listId).pipe(
					map(listRun => ListActions.createListRunSuccess({ listRun })),
					catchError(error => of(ListActions.createListRunFailure({ error })))
				)
			)
		)
	);
}
