import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { SubscriptionService, SubscriptionStatus, SponsoredCollaborator, PendingSponsorInvitation, CollaboratorCheck } from '../../services/subscription.service';
import { UserService } from '../../services/user.service';
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
	private userService = inject(UserService);
	private snackbar = inject(SnackbarService);
	private titleService = inject(TitleService);
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private userStore = inject(UserStore);

	status = signal<SubscriptionStatus | null>(null);
	collaborators = signal<SponsoredCollaborator[]>([]);
	pendingInvitations = signal<PendingSponsorInvitation[]>([]);
	loading = signal(true);
	working = signal(false);
	confirmCancel = signal(false);

	showPaymentForm = signal(false);
	paymentLoading = signal(false);

	addFreeEmail = '';
	addingFreeCollaborator = signal(false);

	addPaidEmail = '';
	addingPaidCollaborator = signal(false);
	paidWarning: { email: string; check: CollaboratorCheck } | null = null;

	showDeleteZone = signal(false);
	deleteConfirmText = '';
	deleting = signal(false);

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
				await this.reloadCollaborators();
			} else {
				await this.userStore.checkDowngradeSelection();
			}
		} catch {
			this.snackbar.showMessage('Failed to load account information.', 'error');
		} finally {
			this.loading.set(false);
		}
	}

	private async reloadCollaborators(): Promise<void> {
		const [c, pending] = await Promise.all([
			firstValueFrom(this.subscriptionService.getCollaborators()),
			firstValueFrom(this.subscriptionService.getPendingInvitations()),
		]);
		this.collaborators.set(c.filter(x => x.isActive));
		this.pendingInvitations.set(pending);
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
		const wasSponsored = this.status()?.isSponsored ?? false;

		const { error } = await this.stripe.confirmPayment({
			elements: this.elements,
			confirmParams: { return_url: `${window.location.origin}/account` },
			redirect: 'if_required'
		});

		if (error) {
			this.snackbar.showMessage(error.message ?? 'Payment failed.', 'error');
			this.working.set(false);
		} else {
			this.showPaymentForm.set(false);
			this.snackbar.showMessage('Payment confirmed — activating your account…', 'success');
			if (wasSponsored) {
				await this.pollForStripeActivation();
			} else {
				await this.pollForPremium();
			}
		}
	}

	private async pollForStripeActivation(attempts = 0): Promise<void> {
		if (attempts > 10) {
			this.snackbar.showMessage('Activation is taking longer than expected. Please refresh.', 'error');
			return;
		}
		await new Promise(r => setTimeout(r, 1500));
		try {
			const s = await firstValueFrom(this.subscriptionService.getStatus());
			if (s.subscriptionSource === 'stripe') {
				this.status.set(s);
				await this.userStore.refreshUser();
				await this.reloadCollaborators();
				this.snackbar.showMessage("You're now on your own Premium plan!", 'success');
				this.working.set(false);
			} else {
				await this.pollForStripeActivation(attempts + 1);
			}
		} catch {
			await this.pollForStripeActivation(attempts + 1);
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
				await this.reloadCollaborators();
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
		return this.collaborators().find(c => c.isFreeSeat) ?? null;
	}

	get paidCollaborators(): SponsoredCollaborator[] {
		return this.collaborators().filter(c => !c.isFreeSeat);
	}

	get pendingFreeInvite(): PendingSponsorInvitation | null {
		return this.pendingInvitations()[0] ?? null;
	}

	displayName(c: SponsoredCollaborator): string {
		const name = [c.firstName, c.lastName].filter(Boolean).join(' ');
		return name || c.email;
	}

	// ─── Free slot ───────────────────────────────────────────────────────────

	async addFreeCollaborator(): Promise<void> {
		const email = this.addFreeEmail.trim();
		if (!email) return;
		this.addingFreeCollaborator.set(true);
		try {
			await firstValueFrom(this.subscriptionService.addCollaborator(email));
			const msg = this.status()?.isSponsored
				? `Invitation sent to ${email}. Once they sign up, don't forget to add them to your lists from the Members tab.`
				: `Invitation sent to ${email}. Once they sign up or log in, they'll get premium access.`;
			this.snackbar.showMessage(msg, 'success');
			this.addFreeEmail = '';
			await this.reloadCollaborators();
		} catch (err: any) {
			this.snackbar.showMessage(err?.error?.message || err?.message || 'Could not add collaborator.', 'error');
		} finally {
			this.addingFreeCollaborator.set(false);
		}
	}

	async cancelPendingInvitation(email: string): Promise<void> {
		this.working.set(true);
		try {
			await firstValueFrom(this.subscriptionService.cancelPendingInvitation(email));
			this.snackbar.showMessage('Invitation cancelled.', 'success');
			await this.reloadCollaborators();
		} catch {
			this.snackbar.showMessage('Could not cancel invitation.', 'error');
		} finally {
			this.working.set(false);
		}
	}

	async removeCollaborator(c: SponsoredCollaborator): Promise<void> {
		this.working.set(true);
		try {
			await firstValueFrom(this.subscriptionService.removeCollaborator(c.userId));
			this.snackbar.showMessage(`${this.displayName(c)} removed. They retain access for 7 days.`, 'success');
			await this.reloadCollaborators();
		} catch (err: any) {
			this.snackbar.showMessage(err?.message || 'Could not remove collaborator.', 'error');
		} finally {
			this.working.set(false);
		}
	}

	// ─── Paid seats ──────────────────────────────────────────────────────────

	async startAddPaidCollaborator(): Promise<void> {
		const email = this.addPaidEmail.trim();
		if (!email) return;
		this.addingPaidCollaborator.set(true);
		this.paidWarning = null;
		try {
			const check = await firstValueFrom(this.subscriptionService.checkCollaborator(email));

			if (check.isAlreadyYourCollaborator) {
				this.snackbar.showMessage('That person is already one of your collaborators.', 'error');
				return;
			}
			if (check.exists && check.isPremium && !check.isAlreadySponsoredByOther) {
				this.snackbar.showMessage(
					'This user already has Premium. They can be added to your lists directly from the Members tab — no seat charge needed.',
					'warning'
				);
				return;
			}
			if (check.isAlreadySponsoredByOther) {
				// Show inline warning — user must confirm before proceeding
				this.paidWarning = { email, check };
				return;
			}

			await this.confirmAddPaidCollaborator(email);
		} catch (err: any) {
			this.snackbar.showMessage(err?.error?.message || err?.message || 'Could not check user.', 'error');
		} finally {
			this.addingPaidCollaborator.set(false);
		}
	}

	async confirmAddPaidCollaborator(email: string): Promise<void> {
		this.paidWarning = null;
		this.addingPaidCollaborator.set(true);
		try {
			await firstValueFrom(this.subscriptionService.addPaidCollaborator(email));
			this.snackbar.showMessage(`${email} added as a paid collaborator (+$1/mo). Remember to invite them to your lists via the Members tab.`, 'success');
			this.addPaidEmail = '';
			await this.reloadCollaborators();
		} catch (err: any) {
			this.snackbar.showMessage(err?.error?.message || err?.message || 'Could not add collaborator.', 'error');
		} finally {
			this.addingPaidCollaborator.set(false);
		}
	}

	dismissPaidWarning(): void {
		this.paidWarning = null;
	}

	async deleteAccount(): Promise<void> {
		if (this.deleteConfirmText !== 'DELETE') return;
		this.deleting.set(true);
		try {
			await firstValueFrom(this.userService.deleteAccount());
			this.userStore.logout();
			this.router.navigate(['/login']);
		} catch {
			this.snackbar.showMessage('Failed to delete account. Please try again.', 'error');
			this.deleting.set(false);
		}
	}
}
