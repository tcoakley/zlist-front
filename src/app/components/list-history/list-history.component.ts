import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ListStore } from '../../stores/list/list.store';
import { UserStore } from '../../stores/user/user.store';
import { TitleService } from '../../services/title.service';
import { SnackbarService } from '../../services/snackbar.service';
import { RunHistorySummary } from '../../../models/list.model';

interface ModalItem {
	id: number;
	itemName: string;
	itemDescription?: string;
	sortOrder: number;
	isComplete: boolean;
	isOneTime: boolean;
}

@Component({
	selector: 'app-list-history',
	standalone: true,
	imports: [],
	templateUrl: './list-history.component.html',
	styleUrls: ['./list-history.component.scss'],
})
export class ListHistoryComponent implements OnInit {
	private listStore = inject(ListStore);
	private userStore = inject(UserStore);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);

	listId = 0;
	listName = '';
	history: RunHistorySummary[] = [];
	loading = false;

	modalRun: RunHistorySummary | null = null;
	modalItems: ModalItem[] = [];
	modalLoading = false;

	async ngOnInit() {
		this.listId = Number(this.route.snapshot.paramMap.get('listId'));

		if (!this.listStore.lists().length) {
			await this.listStore.loadLists();
		}

		const list = this.listStore.lists().find(l => l.id === this.listId);
		if (!list) {
			this.router.navigate(['/lists']);
			return;
		}

		this.listName = list.listName;
		this.titleService.setTitle(`${list.listName} History`);

		this.loading = true;
		const history = await this.listStore.loadListRunHistory(this.listId);
		if (history !== null) {
			this.history = history;
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
		}
		this.loading = false;
	}

	goBack() {
		this.router.navigate(['/lists']);
	}

	formatDateTime(dateStr: string): string {
		return new Date(dateStr).toLocaleString(undefined, {
			month: 'short', day: 'numeric', year: 'numeric',
			hour: 'numeric', minute: '2-digit'
		});
	}

	get sortedModalItems(): ModalItem[] {
		const byOrder = (a: ModalItem, b: ModalItem) => a.sortOrder - b.sortOrder;
		if (this.userStore.user()?.sortCompletedToBottom ?? true) {
			const incomplete = this.modalItems.filter(i => !i.isComplete).sort(byOrder);
			const complete = this.modalItems.filter(i => i.isComplete).sort(byOrder);
			return [...incomplete, ...complete];
		}
		return [...this.modalItems].sort(byOrder);
	}

	async openView(run: RunHistorySummary) {
		this.modalRun = run;
		this.modalLoading = true;
		const fullRun = await this.listStore.loadListRun(this.listId, run.id);
		if (fullRun) {
			this.modalItems = fullRun.items.map(i => ({
				id: i.id,
				itemName: i.listItemName,
				itemDescription: i.listItemDescription,
				sortOrder: i.sortOrder,
				isComplete: !!i.completedAt,
				isOneTime: !i.listItemId,
			}));
		} else {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			this.modalRun = null;
		}
		this.modalLoading = false;
	}

	closeModal() {
		this.modalRun = null;
		this.modalItems = [];
	}
}
