import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ListState } from './list.reducer';

export const selectListState = createFeatureSelector<ListState>('lists');

export const selectAllLists = createSelector(
	selectListState,
	(state) => state.lists
);

export const selectListById = (listId: number) => createSelector(
	selectAllLists,
	(lists) => lists.find(list => list.id === listId)
);

export const selectListLoading = createSelector(
	selectListState,
	(state) => state.loading
);

export const selectListError = createSelector(
	selectListState,
	(state) => state.error
);

export const selectAllListRuns = createSelector(
	selectAllLists,
	(lists) => lists.flatMap(list => list.listRuns || [])
);

export const selectListRunByListId = (listId: number) => createSelector(
	selectAllLists,
	(lists) => lists.find(l => l.id === listId)?.listRuns || []
);
