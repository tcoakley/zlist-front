import { Injectable, signal, computed, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { List, ListItem, ListInvitationInfo, ListMember, ListPendingInvite, ListRun, ListRunItem, RunHistorySummary, InviteResult, UserPendingInvitation } from '../../../models/list.model';
import { ListService } from '../../services/list.service';

@Injectable({ providedIn: 'root' })
export class ListStore {
	private listService = inject(ListService);

	readonly lists = signal<List[]>([]);
	readonly pendingInvitations = signal<UserPendingInvitation[]>([]);
	readonly loading = signal(false);
	readonly error = signal<any>(null);

	readonly allListRuns = computed(() => this.lists().flatMap(l => l.listRuns ?? []));

	listById(listId: number) {
		return computed(() => this.lists().find(l => l.id === listId));
	}

	listRunsById(listId: number) {
		return computed(() => this.lists().find(l => l.id === listId)?.listRuns ?? []);
	}

	async loadLists(): Promise<void> {
		this.loading.set(true);
		this.error.set(null);
		try {
			const lists = await firstValueFrom(this.listService.getLists());
			this.lists.set(lists);
		} catch (err: any) {
			this.error.set(err?.error ?? err);
		} finally {
			this.loading.set(false);
		}
	}

	async addList(list: List): Promise<List | null> {
		this.loading.set(true);
		this.error.set(null);
		try {
			const newList = await firstValueFrom(this.listService.addList(list));
			this.lists.update(lists => [...lists, newList]);
			return newList;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		} finally {
			this.loading.set(false);
		}
	}

	async editList(list: List): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.editList(list));
			this.lists.update(lists => lists.map(l => l.id === list.id
				? { ...l, listName: list.listName, listDescription: list.listDescription }
				: l
			));
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async deleteList(listId: number): Promise<void> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.deleteList(listId));
			this.lists.update(lists => lists.filter(l => l.id !== listId));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
		}
	}

	async leaveList(listId: number): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.leaveList(listId));
			this.lists.update(lists => lists.filter(l => l.id !== listId));
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async addListItem(item: ListItem): Promise<ListItem | null> {
		this.error.set(null);
		try {
			const newItem = await firstValueFrom(this.listService.addListItem(item));
			this.lists.update(lists =>
				lists.map(l => l.id === newItem.listId
					? { ...l, items: [...l.items, newItem] }
					: l
				)
			);
			return newItem;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async editListItem(item: ListItem): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.editListItem(item));
			this.lists.update(lists =>
				lists.map(l => l.id === item.listId
					? { ...l, items: l.items.map(i => i.id === item.id ? item : i) }
					: l
				)
			);
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async deleteListItem(itemId: number): Promise<void> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.deleteListItem(itemId));
			this.lists.update(lists =>
				lists.map(l => ({ ...l, items: l.items.filter(i => i.id !== itemId) }))
			);
		} catch (err: any) {
			this.error.set(err?.error ?? err);
		}
	}

	async loadList(listId: number): Promise<List | null> {
		this.error.set(null);
		try {
			const list = await firstValueFrom(this.listService.getList(listId));
			this.lists.update(lists =>
				lists.map(l => l.id === listId ? { ...l, items: list.items, isOwner: list.isOwner } : l)
			);
			return this.lists().find(l => l.id === listId) ?? null;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async loadListRun(listId: number, runId: number): Promise<ListRun | null> {
		this.error.set(null);
		try {
			const run = await firstValueFrom(this.listService.getListRun(runId));
			this.lists.update(lists =>
				lists.map(l => l.id === listId
					? { ...l, listRuns: [...(l.listRuns ?? []).filter(r => r.id !== run.id), run] }
					: l
				)
			);
			return run;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async createListRun(listId: number): Promise<ListRun | null> {
		this.error.set(null);
		try {
			const listRun = await firstValueFrom(this.listService.createListRun(listId));
			this.lists.update(lists =>
				lists.map(l => l.id === listId
					? { ...l, listRuns: [...(l.listRuns ?? []), listRun] }
					: l
				)
			);
			return listRun;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async completeListRun(listId: number, runId: number): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.completeListRun(runId));
			this.lists.update(lists =>
				lists.map(l => l.id === listId ? { ...l, activeRunId: 0 } : l)
			);
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async toggleListRunItem(runItemId: number, runId: number, complete: boolean): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.setListRunItemCompletion(runItemId, runId, complete));
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async addRunItem(listRunId: number, listId: number, itemName: string, oneTime: boolean): Promise<ListRunItem | null> {
		this.error.set(null);
		try {
			return await firstValueFrom(this.listService.addRunItem(listRunId, listId, itemName, oneTime));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async loadListRunHistory(listId: number): Promise<RunHistorySummary[] | null> {
		this.error.set(null);
		try {
			return await firstValueFrom(this.listService.getListRunHistory(listId));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async deleteListRun(runId: number): Promise<boolean> {
		this.error.set(null);
		try {
			return await firstValueFrom(this.listService.deleteListRun(runId));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	// ─── Shared list methods ────────────────────────────────────────────────────

	async getListMembers(listId: number): Promise<ListMember[] | null> {
		this.error.set(null);
		try {
			return await firstValueFrom(this.listService.getListMembers(listId));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async getPendingInvitations(listId: number): Promise<ListPendingInvite[] | null> {
		this.error.set(null);
		try {
			return await firstValueFrom(this.listService.getPendingInvitations(listId));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async inviteToList(listId: number, email: string, sponsorConfirmed?: boolean): Promise<InviteResult | null> {
		this.error.set(null);
		try {
			return await firstValueFrom(this.listService.inviteToList(listId, email, sponsorConfirmed));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async removeListMember(listId: number, memberId: number): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.removeListMember(listId, memberId));
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async acceptInvitation(token: string): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.acceptInvitation(token));
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async getInvitation(token: string): Promise<ListInvitationInfo | null> {
		this.error.set(null);
		try {
			return await firstValueFrom(this.listService.getInvitation(token));
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return null;
		}
	}

	async loadPendingInvitations(): Promise<void> {
		try {
			const invites = await firstValueFrom(this.listService.getMyPendingInvitations());
			this.pendingInvitations.set(invites);
		} catch {
			this.pendingInvitations.set([]);
		}
	}

	async acceptPendingInvitation(token: string): Promise<boolean> {
		this.error.set(null);
		try {
			await firstValueFrom(this.listService.acceptInvitation(token));
			this.pendingInvitations.update(inv => inv.filter(i => i.token !== token));
			return true;
		} catch (err: any) {
			this.error.set(err?.error ?? err);
			return false;
		}
	}

	async declinePendingInvitation(token: string): Promise<void> {
		try {
			await firstValueFrom(this.listService.declineInvitation(token));
			this.pendingInvitations.update(inv => inv.filter(i => i.token !== token));
		} catch {
			// silently ignore — card disappears optimistically on click
		}
	}
}
