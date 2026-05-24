import { Component, inject, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { UserStore } from '../../stores/user/user.store';
import { SubscriptionService, SelectionListItem } from '../../services/subscription.service';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
	selector: 'app-select-lists',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './select-lists.component.html',
	styleUrl: './select-lists.component.scss'
})
export class SelectListsComponent implements OnInit {
	private userStore = inject(UserStore);
	private subscriptionService = inject(SubscriptionService);
	private snackbar = inject(SnackbarService);
	private router = inject(Router);

	lists = signal<SelectionListItem[]>([]);
	selectedIds = signal<Set<number>>(new Set());
	allowedCount = signal(2);
	loading = signal(true);
	saving = signal(false);

	ngOnInit(): void {
		if (!this.userStore.isLoggedIn()) {
			this.router.navigate(['/login']);
			return;
		}
		if (!this.userStore.needsDowngradeSelection()) {
			this.router.navigate(['/lists']);
			return;
		}
		this.loadLists();
	}

	private async loadLists(): Promise<void> {
		try {
			const status = await firstValueFrom(this.subscriptionService.checkNeedsSelection());
			if (!status.needsSelection) {
				this.userStore.needsDowngradeSelection.set(false);
				this.router.navigate(['/lists']);
				return;
			}
			this.lists.set(status.lists);
			this.allowedCount.set(status.allowedCount);
			// Pre-select first N non-archived lists
			const preselect = status.lists.filter(l => !l.isArchived).slice(0, status.allowedCount);
			this.selectedIds.set(new Set(preselect.map(l => l.id)));
		} finally {
			this.loading.set(false);
		}
	}

	toggleList(id: number): void {
		const current = new Set(this.selectedIds());
		if (current.has(id)) {
			current.delete(id);
		} else {
			if (current.size >= this.allowedCount()) {
				this.snackbar.showMessage(`You can only keep ${this.allowedCount()} lists on the free plan.`, 'warning');
				return;
			}
			current.add(id);
		}
		this.selectedIds.set(current);
	}

	isSelected(id: number): boolean {
		return this.selectedIds().has(id);
	}

	get canConfirm(): boolean {
		return this.selectedIds().size <= this.allowedCount() && !this.saving();
	}

	async confirm(): Promise<void> {
		if (this.saving()) return;
		this.saving.set(true);
		try {
			await firstValueFrom(this.subscriptionService.selectLists([...this.selectedIds()]));
			this.userStore.needsDowngradeSelection.set(false);
			this.snackbar.showMessage('Your lists have been updated.', 'success');
			this.router.navigate(['/lists']);
		} catch {
			this.snackbar.showMessage('Something went wrong. Please try again.', 'error');
		} finally {
			this.saving.set(false);
		}
	}
}
