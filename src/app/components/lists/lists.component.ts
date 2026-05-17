import { Component, OnInit, OnDestroy, inject, Injector, effect } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { ListStore } from '../../stores/list/list.store';
import { List } from '../../../models/list.model';

@Component({
	selector: 'app-lists',
	standalone: true,
	imports: [FormsModule, AutofocusDirective],
	templateUrl: './lists.component.html',
	styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit, OnDestroy {
	protected listStore = inject(ListStore);
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);
	private injector = inject(Injector);

	showForm = false;
	listName = '';
	listDescription = '';
	expandedListIds = new Set<number>();
	confirmingDeleteId: number | null = null;

	ngOnInit() {
		this.titleService.setTitle('Lists');
		this.titleService.setHelpContext('lists');
		this.listStore.loadLists();

		let triggered = false;
		effect(() => {
			if (!this.listStore.loading() && this.listStore.lists().length === 0 && !triggered) {
				triggered = true;
				setTimeout(() => this.titleService.setAnimateHelp(true), 750);
			}
		}, { injector: this.injector });
	}

	ngOnDestroy() {
		this.titleService.setHelpContext(null);
		this.titleService.setAnimateHelp(false);
	}

	openForm() {
		this.showForm = true;
		this.titleService.setHelpContext('create-list');
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

	startDelete(id: number) {
		this.confirmingDeleteId = id;
	}

	cancelDelete() {
		this.confirmingDeleteId = null;
	}

	async confirmDelete(id: number) {
		await this.listStore.deleteList(id);
		if (this.listStore.error()) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
		this.confirmingDeleteId = null;
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
