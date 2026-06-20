import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { ListStore } from '../../stores/list/list.store';
import { UserStore } from '../../stores/user/user.store';
import { TitleService } from '../../services/title.service';
import { SnackbarService } from '../../services/snackbar.service';
import { RunHubService } from '../../services/run-hub.service';
import { ListRunItem } from '../../../models/list.model';

interface RunItem {
	id: number;
	itemName: string;
	itemDescription?: string;
	sortOrder: number;
	isComplete: boolean;
	isExpanded: boolean;
	isToggling: boolean;
	isOneTime: boolean;
	completedByInitials?: string;
	completedByName?: string;
}

@Component({
	selector: 'app-list-run',
	standalone: true,
	imports: [FormsModule, AutofocusDirective, RouterLink],
	templateUrl: './list-run.component.html',
	styleUrls: ['./list-run.component.scss'],
})
export class ListRunComponent implements OnInit, OnDestroy, AfterViewInit {
	protected listStore = inject(ListStore);
	private userStore = inject(UserStore);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);
	private runHubService = inject(RunHubService);

	@ViewChild('addItemSection') addItemSection?: ElementRef;

	listId = 0;
	runId = 0;
	listName = '';
	listDescription = '';
	ownerName = '';
	memberCount = 0;
	loading = true;
	viewReady = false;
	runItems: RunItem[] = [];
	displayItems: RunItem[] = [];
	confirmingComplete = false;
	showAddItem = false;
	newItemName = '';
	isSavingItem = false;

	private get sortedItems(): RunItem[] {
		const byOrder = (a: RunItem, b: RunItem) => a.sortOrder - b.sortOrder;
		if (this.userStore.user()?.sortCompletedToBottom ?? true) {
			const incomplete = this.runItems.filter(i => !i.isComplete).sort(byOrder);
			const complete = this.runItems.filter(i => i.isComplete).sort(byOrder);
			return [...incomplete, ...complete];
		}
		return [...this.runItems].sort(byOrder);
	}

	private refreshDisplay(delay = 0) {
		if (delay === 0) {
			this.displayItems = this.sortedItems;
		} else {
			setTimeout(() => this.displayItems = this.sortedItems, delay);
		}
	}

	get allComplete(): boolean {
		return this.runItems.length > 0 && this.runItems.every(i => i.isComplete);
	}

	get someComplete(): boolean {
		return this.runItems.some(i => i.isComplete);
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.viewReady = true, 100);
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

	ngOnDestroy() {
		this.runHubService.disconnect();
	}

	private async initRun() {
		const list = this.listStore.lists().find(l => l.id === this.listId);
		if (!list) { this.router.navigate(['/lists']); return; }

		this.listName = list.listName;
		this.listDescription = list.listDescription ?? '';
		this.ownerName = list.ownerName ?? '';
		this.memberCount = list.memberCount ?? 1;
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
			isOneTime: !i.listItemId,
			completedByInitials: i.completedByInitials,
			completedByName: i.completedByName,
		}));
		this.refreshDisplay();
		this.loading = false;

		this.connectHub();
	}

	private async connectHub() {
		const user = this.userStore.user();
		const initials = user
			? `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`.toUpperCase()
			: '';
		const displayName = user
			? `${user.firstName ?? ''} ${user.lastName ?? ''} - ${user.email ?? ''}`.trim()
			: '';
		try {
			await this.runHubService.connect(this.runId, initials, displayName, {
				onItemToggled: (runItemId, isComplete, completedByInitials, completedByName) =>
					this.onHubItemToggled(runItemId, isComplete, completedByInitials, completedByName),
				onRunCompleted: () => this.onHubRunCompleted(),
				onItemAdded: (item) => this.onHubItemAdded(item),
			});
		} catch (err) {
			console.error('[SignalR] Failed to connect:', err);
		}
	}

	private onHubItemToggled(runItemId: number, isComplete: boolean, completedByInitials: string, completedByName: string) {
		const item = this.runItems.find(i => i.id === runItemId);
		if (!item) return;
		item.isComplete = isComplete;
		item.completedByInitials = isComplete ? completedByInitials : undefined;
		item.completedByName = isComplete ? completedByName : undefined;
		item.isToggling = false;
		const delay = isComplete && (this.userStore.user()?.sortCompletedToBottom ?? true) ? 250 : 0;
		this.refreshDisplay(delay);
	}

	private onHubRunCompleted() {
		this.snackbarService.showMessage('Run completed.', 'success');
		this.router.navigate(['/lists']);
	}

	private onHubItemAdded(item: ListRunItem) {
		if (this.runItems.find(i => i.id === item.id)) return;
		const nextSort = this.runItems.length
			? Math.max(...this.runItems.map(i => i.sortOrder)) + 10
			: 10;
		this.runItems.push({
			id: item.id,
			itemName: item.listItemName,
			itemDescription: item.listItemDescription,
			sortOrder: nextSort,
			isComplete: !!item.completedAt,
			isExpanded: false,
			isToggling: false,
			isOneTime: !item.listItemId,
			completedByInitials: item.completedByInitials,
			completedByName: item.completedByName,
		});
		this.refreshDisplay();
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

		const delay = (this.userStore.user()?.sortCompletedToBottom ?? true) ? 250 : 0;
		this.refreshDisplay(delay);
		const ok = await this.listStore.toggleListRunItem(item.id, this.runId, !wasComplete);
		if (!ok) {
			item.isComplete = wasComplete;
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			this.refreshDisplay();
		}
		item.isToggling = false;

		if (ok && this.allComplete) {
			await this.finishRun();
		}
	}

	async checkAll() {
		if (this.allComplete) return;
		const unchecked = this.runItems.filter(i => !i.isComplete);
		unchecked.forEach(i => i.isComplete = true);
		this.refreshDisplay(0);
		await Promise.all(unchecked.map(i => this.listStore.toggleListRunItem(i.id, this.runId, true)));
		await this.finishRun(this.runItems.length);
	}

	private async finishRun(completedCount?: number) {
		const total = this.runItems.length;
		const completed = completedCount ?? this.runItems.filter(i => i.isComplete).length;
		const ok = await this.listStore.completeListRun(this.listId, this.runId);
		if (ok) {
			this.snackbarService.showMessage(`List completed — ${completed} of ${total} items checked`, 'success');
			this.router.navigate(['/lists']);
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
	}

	startCompleteAll() {
		this.confirmingComplete = true;
	}

	cancelCompleteAll() {
		this.confirmingComplete = false;
	}

	openAddItem() {
		this.showAddItem = true;
		setTimeout(() => {
			this.addItemSection?.nativeElement?.scrollIntoView({ behavior: 'smooth', block: 'end' });
		}, 50);
	}

	cancelAddItem() {
		this.showAddItem = false;
		this.newItemName = '';
	}

	async saveRunItem(oneTime: boolean) {
		if (!this.newItemName.trim() || this.isSavingItem) return;
		this.isSavingItem = true;
		const nextSort = this.runItems.length ? Math.max(...this.runItems.map(i => i.sortOrder)) + 10 : 10;
		const result = await this.listStore.addRunItem(this.runId, this.listId, this.newItemName.trim(), oneTime);
		if (result) {
			if (!this.runItems.find(i => i.id === result.id)) {
				this.runItems.push({
					id: result.id,
					itemName: result.listItemName,
					itemDescription: result.listItemDescription,
					sortOrder: nextSort,
					isComplete: false,
					isExpanded: false,
					isToggling: false,
					isOneTime: !result.listItemId,
				});
			}
			this.refreshDisplay();
			this.showAddItem = false;
			this.newItemName = '';
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
		this.isSavingItem = false;
	}

	async confirmCompleteList() {
		this.confirmingComplete = false;
		await this.finishRun();
	}
}
