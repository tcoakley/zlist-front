import { Component, OnInit, OnDestroy, inject, Injector, effect, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { ListStore } from '../../stores/list/list.store';
import { UserStore } from '../../stores/user/user.store';
import { List } from '../../../models/list.model';

@Component({
	selector: 'app-lists',
	standalone: true,
	imports: [FormsModule, AutofocusDirective, RouterLink],
	templateUrl: './lists.component.html',
	styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit, OnDestroy, AfterViewInit  {
	protected listStore = inject(ListStore);
	protected userStore = inject(UserStore);
	protected loading = true;
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);
	private injector = inject(Injector);


	showForm = false;
	showUpgradePrompt = false;
	listName = '';
	listDescription = '';
	expandedListIds = new Set<number>();
	confirmingDeleteId: number | null = null;

	get atListLimit(): boolean {
		return !this.userStore.isPremium() &&
			this.listStore.lists().filter(l => l.isOwner).length >= 2;
	}

	get sortedLists(): List[] {
		return [...this.listStore.lists()].sort((a, b) => {
			if (!a.lastRun && !b.lastRun) return 0;
			if (!a.lastRun) return 1;
			if (!b.lastRun) return -1;
			return new Date(b.lastRun).getTime() - new Date(a.lastRun).getTime();
		});
	}

	ngOnInit() {
		this.titleService.setTitle('Lists');
		this.titleService.setHelpContext('lists');
		this.listStore.loadLists();
		this.listStore.loadPendingInvitations();

		let triggered = false;
		let defaultExpanded = false;

		// If lists are already cached, expand immediately so first render is correct
		if (this.listStore.lists().length > 0) {
			defaultExpanded = true;
			this.sortedLists.slice(0, 5).forEach(l => this.expandedListIds.add(l.id));
		}

		effect(() => {
			const lists = this.listStore.lists();
			const loading = this.listStore.loading();

			if (!loading && lists.length === 0 && !triggered) {
				triggered = true;
				const delay = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ? 1500 : 750;
				setTimeout(() => this.titleService.setAnimateHelp(true), delay);
			}

			if (!loading && lists.length > 0 && !defaultExpanded) {
				defaultExpanded = true;
				this.sortedLists.slice(0, 5).forEach(l => this.expandedListIds.add(l.id));
			}
		}, { injector: this.injector });
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	ngOnDestroy() {
		this.titleService.setHelpContext(null);
		this.titleService.setAnimateHelp(false);
	}

	openForm() {
		if (this.atListLimit) {
			this.showUpgradePrompt = true;
			return;
		}
		this.showForm = true;
		this.titleService.setHelpContext('create-list');
	}

	dismissUpgradePrompt() {
		this.showUpgradePrompt = false;
	}

	goToAccount() {
		this.router.navigate(['/account']);
	}

	cancelForm() {
		this.showForm = false;
		this.listName = '';
		this.listDescription = '';
		this.titleService.setHelpContext('lists');
	}

	async saveList() {
		if (!this.listName.trim()) return;

		const newList = await this.listStore.addList({
			id: 0,
			listName: this.listName.trim(),
			listDescription: this.listDescription.trim() || undefined,
			activeRunId: 0,
			totalRuns: 0,
			totalItems: 0,
			isOwner: true,
			items: [],
			listRuns: []
		});

		if (!newList) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			return;
		}

		this.router.navigate(['/lists', newList.id]);
	}

	navigateToList(id: number) {
		this.router.navigate(['/lists', id]);
	}

	toggleDescription(id: number) {
		if (this.expandedListIds.has(id)) {
			this.expandedListIds.delete(id);
		} else {
			this.expandedListIds.add(id);
		}
	}

	isExpanded(id: number): boolean {
		return this.expandedListIds.has(id);
	}

	continueRun(listId: number, runId: number) {
		this.router.navigate(['/lists', listId, 'run', runId]);
	}

	async launchList(id: number) {
		const run = await this.listStore.createListRun(id);
		if (run) {
			this.router.navigate(['/lists', id, 'run', run.id]);
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
	}

	isOwner(id: number): boolean {
		return this.listStore.lists().find(l => l.id === id)?.isOwner ?? false;
	}

	startDelete(id: number) {
		this.confirmingDeleteId = id;
	}

	cancelDelete() {
		this.confirmingDeleteId = null;
	}

	async confirmDelete(id: number) {
		if (this.isOwner(id)) {
			await this.listStore.deleteList(id);
		} else {
			await this.listStore.leaveList(id);
		}
		if (this.listStore.error()) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
		this.confirmingDeleteId = null;
	}

	async acceptPendingInvitation(token: string, requiresPremium: boolean) {
		if (requiresPremium) {
			this.router.navigate(['/account']);
			return;
		}
		const ok = await this.listStore.acceptPendingInvitation(token);
		if (ok) {
			await this.listStore.loadLists();
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
	}

	async declinePendingInvitation(token: string) {
		await this.listStore.declinePendingInvitation(token);
	}

	navigateToHistory(id: number) {
		this.router.navigate(['/lists', id, 'history']);
	}

	getRunCount(list: List): number {
		return list.totalRuns;
	}

	getLastRunDate(list: List): string | null {
		if (!list.lastRun) return null;
		return new Date(list.lastRun).toLocaleDateString(undefined, {
			year: 'numeric', month: 'short', day: 'numeric'
		});
	}
}
