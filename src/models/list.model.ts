export interface ListItem {
	id: number;
	listId: number;
	itemName: string;
	itemDescription?: string;
	sortOrder: number;
}

export interface ListRunItem {
	id: number;
	listRunId: number;
	listItemId?: number;
	listItemName: string;
	listItemDescription?: string;
	sortOrder: number;
	completedAt?: string;
	completedBy?: number;
}

export interface ListRun {
	id: number;
	listId: number;
	createdAt?: string;
	items: ListRunItem[];
	isComplete: boolean;
}

export interface List {
	id: number;
	listName: string;
	listDescription?: string;
	createdAt?: string;
	updatedAt?: string;
	items: ListItem[];
	listRuns: ListRun[];
}
