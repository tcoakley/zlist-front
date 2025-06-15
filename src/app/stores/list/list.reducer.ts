import { createReducer, on } from '@ngrx/store';
import * as ListActions from './list.actions';
import { List, ListItem, ListRun } from '../../../models/list.model';

export interface ListState {
	lists: List[];
	loading: boolean;
	error: any;
}

export const initialState: ListState = {
	lists: [],
	loading: false,
	error: null
};

export const listReducer = createReducer(
	initialState,

	// Load Lists
	on(ListActions.loadLists, (state) => ({
		...state,
		loading: true,
		error: null
	})),
	on(ListActions.loadListsSuccess, (state, { lists }) => ({
		...state,
		lists,
		loading: false
	})),
	on(ListActions.loadListsFailure, (state, { error }) => ({
		...state,
		error,
		loading: false
	})),

	// Add List
	on(ListActions.addList, (state) => ({
		...state,
		loading: true,
		error: null
	})),
	on(ListActions.addListSuccess, (state, { list }) => ({
		...state,
		lists: [...state.lists, list],
		loading: false
	})),
	on(ListActions.addListFailure, (state, { error }) => ({
		...state,
		error,
		loading: false
	})),

	// Edit List
	on(ListActions.editListSuccess, (state, { list }) => ({
		...state,
		lists: state.lists.map(l => l.id === list.id ? list : l)
	})),

	// Delete List
	on(ListActions.deleteListSuccess, (state, { listId }) => ({
		...state,
		lists: state.lists.filter(l => l.id !== listId)
	})),

	// Add List Item
	on(ListActions.addListItemSuccess, (state, { item }) => ({
		...state,
		lists: state.lists.map(list =>
			list.id === item.listId
				? { ...list, items: [...list.items, item] }
				: list
		)
	})),

	// Edit List Item
	on(ListActions.editListItemSuccess, (state, { item }) => ({
		...state,
		lists: state.lists.map(list =>
			list.id === item.listId
				? {
					...list,
					items: list.items.map(i => i.id === item.id ? item : i)
				}
				: list
		)
	})),

	// Delete List Item
	on(ListActions.deleteListItemSuccess, (state, { itemId }) => ({
		...state,
		lists: state.lists.map(list => ({
			...list,
			items: list.items.filter(i => i.id !== itemId)
		}))
	})),

	// Create List Run
	on(ListActions.createListRunSuccess, (state, { listRun }) => ({
		...state,
		lists: state.lists.map(list =>
			list.id === listRun.listId
				? {
					...list,
					listRuns: [...(list.listRuns || []), listRun]
				}
				: list
		)
	}))
);
