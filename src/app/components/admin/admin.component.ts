import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SubscriptionService, SubscriptionStatus } from '../../services/subscription.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';

interface FormMessage {
	text: string;
	type: 'success' | 'error';
}

@Component({
	selector: 'app-admin',
	standalone: true,
	imports: [CommonModule, FormsModule, RouterLink],
	templateUrl: './admin.component.html',
	styleUrl: './admin.component.scss'
})
export class AdminComponent {
	private subscriptionService = inject(SubscriptionService);
	private snackbar = inject(SnackbarService);
	private titleService = inject(TitleService);

	// ─── Grant form ───────────────────────────────────────────────────────────
	grantEmail = '';
	grantSource: 'gift' | 'admin' = 'gift';
	grantExpiresAt = '';
	grantWorking = signal(false);
	grantMessage = signal<FormMessage | null>(null);

	// ─── Revoke form ──────────────────────────────────────────────────────────
	revokeEmail = '';
	revokeWorking = signal(false);
	revokeMessage = signal<FormMessage | null>(null);

	// ─── Status form ──────────────────────────────────────────────────────────
	statusEmail = '';
	statusWorking = signal(false);
	statusResult = signal<SubscriptionStatus | null>(null);
	statusSearchedEmail = signal('');
	statusMessage = signal<FormMessage | null>(null);

	constructor() {
		this.titleService.setTitle('Admin');
	}

	async grant(): Promise<void> {
		const email = this.grantEmail.trim();
		if (!email) return;
		this.grantWorking.set(true);
		this.grantMessage.set(null);
		try {
			await firstValueFrom(
				this.subscriptionService.adminGrant(email, this.grantSource, this.grantExpiresAt || undefined)
			);
			this.grantMessage.set({ text: `Premium granted to ${email}.`, type: 'success' });
			this.grantEmail = '';
			this.grantExpiresAt = '';
		} catch (err: any) {
			this.grantMessage.set({ text: err?.message || 'Grant failed.', type: 'error' });
		} finally {
			this.grantWorking.set(false);
		}
	}

	async revoke(): Promise<void> {
		const email = this.revokeEmail.trim();
		if (!email) return;
		this.revokeWorking.set(true);
		this.revokeMessage.set(null);
		try {
			await firstValueFrom(this.subscriptionService.adminRevoke(email));
			this.revokeMessage.set({ text: `Premium revoked for ${email}.`, type: 'success' });
			this.revokeEmail = '';
		} catch (err: any) {
			this.revokeMessage.set({ text: err?.message || 'Revoke failed.', type: 'error' });
		} finally {
			this.revokeWorking.set(false);
		}
	}

	async checkStatus(): Promise<void> {
		const email = this.statusEmail.trim();
		if (!email) return;
		this.statusWorking.set(true);
		this.statusMessage.set(null);
		this.statusResult.set(null);
		try {
			const result = await firstValueFrom(this.subscriptionService.adminGetStatus(email));
			this.statusResult.set(result);
			this.statusSearchedEmail.set(email);
		} catch (err: any) {
			this.statusMessage.set({ text: err?.message || 'Lookup failed.', type: 'error' });
		} finally {
			this.statusWorking.set(false);
		}
	}
}
