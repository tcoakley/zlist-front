import { List } from '../../../models/list.model';

export interface ListState {
	lists: List[];
	loading: boolean;
	error: any;
}

export const initialListState: ListState = {
	lists: [],
	loading: false,
	error: null
};
