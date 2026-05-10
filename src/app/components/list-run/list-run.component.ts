import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ListStore } from '../../stores/list/list.store';
import { TitleService } from '../../services/title.service';
import { SnackbarService } from '../../services/snackbar.service';

interface RunItem {
	id: number;
	itemName: string;
	itemDescription?: string;
	sortOrder: number;
	isComplete: boolean;
	isExpanded: boolean;
	isToggling: boolean;
}

@Component({
	selector: 'app-list-run',
	standalone: true,
	imports: [MatCheckboxModule],
	templateUrl: './list-run.component.html',
	styleUrls: ['./list-run.component.scss'],
})
export class ListRunComponent implements OnInit {
	protected listStore = inject(ListStore);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);

	listId = 0;
	runId = 0;
	listName = '';
	runItems: RunItem[] = [];
	confirmingComplete = false;

	get sortedItems(): RunItem[] {
		const incomplete = this.runItems.filter(i => !i.isComplete).sort((a, b) => a.sortOrder - b.sortOrder);
		const complete = this.runItems.filter(i => i.isComplete).sort((a, b) => a.sortOrder - b.sortOrder);
		return [...incomplete, ...complete];
	}

	get allComplete(): boolean {
		return this.runItems.length > 0 && this.runItems.every(i => i.isComplete);
	}

	ngOnInit() {
		this.listId = Number(this.route.snapshot.paramMap.get('listId'));
		this.runId = Number(this.route.snapshot.paramMap.get('runId'));

		if (!this.listStore.lists().length) {
			this.listStore.loadLists().then(() => this.initRun());
		} else {
			this.initRun();
		}
	}

	private async initRun() {
		const list = this.listStore.lists().find(l => l.id === this.listId);
		if (!list) { this.router.navigate(['/lists']); return; }

		this.listName = list.listName;
		this.titleService.setTitle(list.listName);

		let run = list.listRuns?.find(r => r.id === this.runId);
		if (!run) {
			run = await this.listStore.loadListRun(this.listId, this.runId) ?? undefined;
			if (!run) {
				this.snackbarService.showMessage(this.listStore.error(), 'error');
				this.router.navigate(['/lists']);
				return;
			}
		}

		this.runItems = run.items.map(i => ({
			id: i.id,
			itemName: i.listItemName,
			itemDescription: i.listItemDescription,
			sortOrder: i.sortOrder,
			isComplete: !!i.completedAt,
			isExpanded: false,
			isToggling: false,
		}));
	}

	goBack() {
		this.router.navigate(['/lists']);
	}

	toggleExpand(item: RunItem, event: Event) {
		event.stopPropagation();
		item.isExpanded = !item.isExpanded;
	}

	async toggleItem(item: RunItem) {
		if (item.isToggling) return;
		item.isToggling = true;
		const wasComplete = item.isComplete;
		item.isComplete = !wasComplete;

		const ok = await this.listStore.toggleListRunItem(item.id, !wasComplete);
		if (!ok) {
			item.isComplete = wasComplete;
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
		item.isToggling = false;
	}

	startCompleteAll() {
		this.confirmingComplete = true;
	}

	cancelCompleteAll() {
		this.confirmingComplete = false;
	}

	async confirmCompleteAll() {
		const ok = await this.listStore.completeListRun(this.listId, this.runId);
		if (!ok) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			this.confirmingComplete = false;
			return;
		}
		this.router.navigate(['/lists']);
	}
}
