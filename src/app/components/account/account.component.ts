import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { SubscriptionService, SubscriptionStatus, SponsoredCollaborator } from '../../services/subscription.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-account',
	standalone: true,
	imports: [CommonModule, RouterLink, FormsModule],
	templateUrl: './account.component.html',
	styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
	private subscriptionService = inject(SubscriptionService);
	private snackbar = inject(SnackbarService);
	private titleService = inject(TitleService);

	status = signal<SubscriptionStatus | null>(null);
	collaborators = signal<SponsoredCollaborator[]>([]);
	loading = signal(true);
	working = signal(false);
	confirmCancel = signal(false);

	addEmail = '';
	addingCollaborator = signal(false);

	ngOnInit(): void {
		this.titleService.setTitle('Account');
		this.loadAll();
	}

	private async loadAll(): Promise<void> {
		try {
			const s = await firstValueFrom(this.subscriptionService.getStatus());
			this.status.set(s);
			if (s.isPremium) {
				const c = await firstValueFrom(this.subscriptionService.getCollaborators());
				this.collaborators.set(c.filter(x => x.isActive));
			}
		} catch {
			this.snackbar.showMessage('Failed to load account information.', 'error');
		} finally {
			this.loading.set(false);
		}
	}

	get freeCollaborator(): SponsoredCollaborator | null {
		const active = this.collaborators();
		return active.length > 0 ? active[0] : null;
	}

	get paidCollaborators(): SponsoredCollaborator[] {
		return this.collaborators().slice(1);
	}

	displayName(c: SponsoredCollaborator): string {
		const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
		return name || c.email;
	}

	async upgrade(): Promise<void> {
		this.working.set(true);
		try {
			await firstValueFrom(this.subscriptionService.upgrade());
			this.snackbar.showMessage('Upgraded to Premium!', 'success');
			await this.loadAll();
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Upgrade failed.', 'error');
		} finally {
			this.working.set(false);
		}
	}

	async cancel(): Promise<void> {
		this.working.set(true);
		this.confirmCancel.set(false);
		try {
			await firstValueFrom(this.subscriptionService.cancelSubscription());
			this.snackbar.showMessage('Subscription cancelled.', 'success');
			await this.loadAll();
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Cancellation failed.', 'error');
		} finally {
			this.working.set(false);
		}
	}

	async addCollaborator(): Promise<void> {
		const email = this.addEmail.trim();
		if (!email) return;
		this.addingCollaborator.set(true);
		try {
			await firstValueFrom(this.subscriptionService.addCollaborator(email));
			this.snackbar.showMessage(`${email} added as a collaborator.`, 'success');
			this.addEmail = '';
			const c = await firstValueFrom(this.subscriptionService.getCollaborators());
			this.collaborators.set(c.filter(x => x.isActive));
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Could not add collaborator.', 'error');
		} finally {
			this.addingCollaborator.set(false);
		}
	}

	async removeCollaborator(c: SponsoredCollaborator): Promise<void> {
		this.working.set(true);
		try {
			await firstValueFrom(this.subscriptionService.removeCollaborator(c.userId));
			this.snackbar.showMessage(`${this.displayName(c)} removed. They will retain access for 7 days.`, 'success');
			const updated = await firstValueFrom(this.subscriptionService.getCollaborators());
			this.collaborators.set(updated.filter(x => x.isActive));
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Could not remove collaborator.', 'error');
		} finally {
			this.working.set(false);
		}
	}
}
