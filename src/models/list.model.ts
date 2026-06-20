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
	completedByInitials?: string;
	completedByName?: string;
}

export interface ListRun {
	id: number;
	listId: number;
	createdAt?: string;
	items: ListRunItem[];
	isComplete: boolean;
}

export interface RunHistorySummary {
	id: number;
	listId: number;
	createdAt: string;
	completedAt?: string;
	totalItems: number;
	completedItems: number;
}

export interface List {
	id: number;
	listName: string;
	listDescription?: string;
	createdAt?: string;
	updatedAt?: string;
	activeRunId: number;
	totalRuns: number;
	lastRun?: string;
	totalItems: number;
	isOwner: boolean;
	memberCount?: number;
	ownerName?: string;
	items: ListItem[];
	listRuns: ListRun[];
}

export interface ListPendingInvite {
	invitedEmail: string;
	isExpired: boolean;
}

export interface ListMember {
	userId: number;
	firstName: string;
	lastName: string;
	email: string;
	isOwner: boolean;
}

export interface AppVersion {
	version: string;
	releasedAt: string;
	notes?: string;
}

export interface InviteResult {
	requiresSponsor: boolean;
	message?: string;
}

export interface ListInvitationInfo {
	listId: number;
	listName: string;
	invitedByName: string;
	invitedEmail: string;
	status: string;
	isExpired: boolean;
	hasAccount: boolean;
}

export interface UserPendingInvitation {
	token: string;
	listId: number;
	listName: string;
	invitedByName: string;
	requiresPremium: boolean;
	expiresAt: string;
}
