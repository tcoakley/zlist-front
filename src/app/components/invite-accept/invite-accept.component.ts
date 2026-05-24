import { Component, OnInit, Injector, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom } from 'rxjs';
import { filter, map, take } from 'rxjs/operators';
import { ListStore } from '../../stores/list/list.store';
import { UserStore } from '../../stores/user/user.store';
import { ListInvitationInfo } from '../../../models/list.model';
import { SnackbarService } from '../../services/snackbar.service';

@Component({
	selector: 'app-invite-accept',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './invite-accept.component.html',
	styleUrls: ['./invite-accept.component.scss'],
})
export class InviteAcceptComponent implements OnInit {
	private route = inject(ActivatedRoute);
	private router = inject(Router);
	private listStore = inject(ListStore);
	protected userStore = inject(UserStore);
	private snackbarService = inject(SnackbarService);
	private injector = inject(Injector);

	token = '';
	invitation: ListInvitationInfo | null = null;
	loading = true;
	accepting = false;
	error = '';

	get isLoggedIn(): boolean {
		return this.userStore.isLoggedIn();
	}

	get loginLink(): string {
		return `/login?returnUrl=/invite/${this.token}`;
	}

	get signupLink(): string {
		return `/signup?inviteToken=${this.token}`;
	}

	async ngOnInit() {
		this.token = this.route.snapshot.paramMap.get('token') ?? '';
		if (!this.token) {
			this.error = 'Invalid invitation link.';
			this.loading = false;
			return;
		}

		// Fetch invitation and wait for auth restore in parallel — whichever is slower wins
		const [info] = await Promise.all([
			this.listStore.getInvitation(this.token),
			this.waitForAuth(),
		]);

		if (info) {
			this.invitation = info;
			if (info.status === 'accepted') {
				this.error = 'This invitation has already been accepted.';
			} else if (info.isExpired) {
				this.error = 'This invitation has expired.';
			} else if (this.isLoggedIn) {
				await this.acceptInvite();
				return;
			}
		} else {
			this.error = 'Invitation not found or invalid.';
		}
		this.loading = false;
	}

	private waitForAuth(): Promise<void> {
		if (this.userStore.authInitialized()) return Promise.resolve();
		return firstValueFrom(
			toObservable(this.userStore.authInitialized, { injector: this.injector }).pipe(
				filter(Boolean),
				take(1),
				map(() => undefined as void)
			)
		);
	}

	async acceptInvite() {
		this.accepting = true;
		const ok = await this.listStore.acceptInvitation(this.token);
		if (ok) {
			await this.listStore.loadLists();
			this.snackbarService.showMessage(`You've joined the list!`, 'success');
			this.router.navigate(['/lists']);
		} else {
			this.error = this.listStore.error() ?? 'Failed to accept invitation.';
			this.loading = false;
		}
		this.accepting = false;
	}
}
