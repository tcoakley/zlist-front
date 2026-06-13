import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { SubscriptionService, SubscriptionStatus, SponsoredCollaborator } from '../../services/subscription.service';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { UserStore } from '../../stores/user/user.store';
import { environment } from '../../../environments/environment';

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
	private route = inject(ActivatedRoute);
	private userStore = inject(UserStore);

	status = signal<SubscriptionStatus | null>(null);
	collaborators = signal<SponsoredCollaborator[]>([]);
	loading = signal(true);
	working = signal(false);
	confirmCancel = signal(false);

	showPaymentForm = signal(false);
	paymentLoading = signal(false);

	addEmail = '';
	addingCollaborator = signal(false);

	private stripe: Stripe | null = null;
	private elements: StripeElements | null = null;

	ngOnInit(): void {
		this.titleService.setTitle('Account');
		this.handleRedirectReturn();
		this.loadAll();
	}

	private handleRedirectReturn(): void {
		const params = this.route.snapshot.queryParams;
		const redirectStatus = params['redirect_status'];
		if (redirectStatus === 'succeeded') {
			this.snackbar.showMessage('Payment confirmed — activating your account…', 'success');
			this.pollForPremium();
		} else if (redirectStatus === 'failed') {
			this.snackbar.showMessage('Payment was not completed. Please try again.', 'error');
		}
	}

	private async loadAll(): Promise<void> {
		try {
			const [s] = await Promise.all([
				firstValueFrom(this.subscriptionService.getStatus()),
				this.userStore.refreshUser()
			]);
			this.status.set(s);
			if (s.isPremium) {
				const c = await firstValueFrom(this.subscriptionService.getCollaborators());
				this.collaborators.set(c.filter(x => x.isActive));
			} else {
				await this.userStore.checkDowngradeSelection();
			}
		} catch {
			this.snackbar.showMessage('Failed to load account information.', 'error');
		} finally {
			this.loading.set(false);
		}
	}

	// ─── Upgrade / Payment Element ────────────────────────────────────────────

	async startUpgrade(): Promise<void> {
		this.paymentLoading.set(true);
		try {
			const { clientSecret } = await firstValueFrom(this.subscriptionService.upgrade());

			this.stripe = await loadStripe(environment.stripePublishableKey);
			if (!this.stripe) throw new Error('Stripe failed to load.');

			this.elements = this.stripe.elements({ clientSecret });
			const email = this.userStore.user()?.email;
			const paymentElement = this.elements.create('payment', {
				defaultValues: {
					billingDetails: { email: email ?? '' }
				}
			});

			this.showPaymentForm.set(true);

			// Allow Angular to render the #payment-element div before mounting
			setTimeout(() => paymentElement.mount('#payment-element'), 0);
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Could not initialize payment.', 'error');
		} finally {
			this.paymentLoading.set(false);
		}
	}

	async confirmPayment(): Promise<void> {
		if (!this.stripe || !this.elements) return;
		this.working.set(true);

		const { error } = await this.stripe.confirmPayment({
			elements: this.elements,
			confirmParams: { return_url: `${window.location.origin}/account` },
			redirect: 'if_required'
		});

		if (error) {
			this.snackbar.showMessage(error.message ?? 'Payment failed.', 'error');
			this.working.set(false);
		} else {
			// No redirect required — payment confirmed inline
			this.showPaymentForm.set(false);
			this.snackbar.showMessage('Payment confirmed — activating your account…', 'success');
			await this.pollForPremium();
		}
	}

	private async pollForPremium(attempts = 0): Promise<void> {
		if (attempts > 10) {
			this.snackbar.showMessage('Activation is taking longer than expected. Please refresh.', 'error');
			return;
		}
		await new Promise(r => setTimeout(r, 1500));
		try {
			const s = await firstValueFrom(this.subscriptionService.getStatus());
			if (s.isPremium) {
				this.status.set(s);
				await this.userStore.refreshUser();
				const c = await firstValueFrom(this.subscriptionService.getCollaborators());
				this.collaborators.set(c.filter(x => x.isActive));
				this.snackbar.showMessage("You're on Premium!", 'success');
				this.working.set(false);
			} else {
				await this.pollForPremium(attempts + 1);
			}
		} catch {
			await this.pollForPremium(attempts + 1);
		}
	}

	// ─── Cancel ──────────────────────────────────────────────────────────────

	async cancel(): Promise<void> {
		this.working.set(true);
		this.confirmCancel.set(false);
		try {
			await firstValueFrom(this.subscriptionService.cancelSubscription());
			this.snackbar.showMessage('Subscription cancelled. You keep access until your billing period ends.', 'success');
			await this.loadAll();
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Cancellation failed.', 'error');
		} finally {
			this.working.set(false);
		}
	}

	get isStripePremium(): boolean {
		return this.status()?.subscriptionSource === 'stripe';
	}

	// === Collaborators ========================================================

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

	async addCollaborator(): Promise<void> {
		const email = this.addEmail.trim();
		if (!email) return;
		this.addingCollaborator.set(true);
		try {
			await firstValueFrom(this.subscriptionService.addCollaborator(email));
			this.snackbar.showMessage(`${email} added. Remember to invite them to your lists via the Members tab.`, 'success');
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
			this.snackbar.showMessage(`${this.displayName(c)} removed. They retain access for 7 days.`, 'success');
			const updated = await firstValueFrom(this.subscriptionService.getCollaborators());
			this.collaborators.set(updated.filter(x => x.isActive));
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Could not remove collaborator.', 'error');
		} finally {
			this.working.set(false);
		}
	}
}
