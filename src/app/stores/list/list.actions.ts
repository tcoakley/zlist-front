import { createAction, props } from '@ngrx/store';
import { List, ListItem, ListRun } from '../../../models/list.model';
import { Result } from '../../../models/result.model';

export const loadLists = createAction('[List] Load Lists');

export const loadListsSuccess = createAction(
	'[List] Load Lists Success',
	props<{ lists: List[] }>()
);

export const loadListsFailure = createAction(
	'[List] Load Lists Failure',
	props<{ error: any }>()
);

export const addList = createAction(
	'[List] Add List',
	props<{ list: List }>()
);

export const addListSuccess = createAction(
	'[List] Add List Success',
	props<{ list: List }>()
);

export const addListFailure = createAction(
	'[List] Add List Failure',
	props<{ error: any }>()
);

export const editList = createAction(
	'[List] Edit List',
	props<{ list: List }>()
);

export const editListSuccess = createAction(
	'[List] Edit List Success',
	props<{ list: List }>()
);

export const editListFailure = createAction(
	'[List] Edit List Failure',
	props<{ error: any }>()
);

export const deleteList = createAction(
	'[List] Delete List',
	props<{ listId: number }>()
);

export const deleteListSuccess = createAction(
	'[List] Delete List Success',
	props<{ listId: number }>()
);

export const deleteListFailure = createAction(
	'[List] Delete List Failure',
	props<{ error: any }>()
);

export const addListItem = createAction(
	'[List] Add List Item',
	props<{ item: ListItem }>()
);

export const addListItemSuccess = createAction(
	'[List] Add List Item Success',
	props<{ item: ListItem }>()
);

export const addListItemFailure = createAction(
	'[List] Add List Item Failure',
	props<{ error: any }>()
);

export const editListItem = createAction(
	'[List] Edit List Item',
	props<{ item: ListItem }>()
);

export const editListItemSuccess = createAction(
	'[List] Edit List Item Success',
	props<{ item: ListItem }>()
);

export const editListItemFailure = createAction(
	'[List] Edit List Item Failure',
	props<{ error: any }>()
);

export const deleteListItem = createAction(
	'[List] Delete List Item',
	props<{ itemId: number }>()
);

export const deleteListItemSuccess = createAction(
	'[List] Delete List Item Success',
	props<{ itemId: number }>()
);

export const deleteListItemFailure = createAction(
	'[List] Delete List Item Failure',
	props<{ error: any }>()
);

export const createListRun = createAction(
	'[List] Create List Run',
	props<{ listId: number }>()
);

export const createListRunSuccess = createAction(
	'[List] Create List Run Success',
	props<{ listRun: ListRun }>()
);

export const createListRunFailure = createAction(
	'[List] Create List Run Failure',
	props<{ error: any }>()
);
