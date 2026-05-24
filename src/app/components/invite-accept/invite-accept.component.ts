import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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

		const info = await this.listStore.getInvitation(this.token);
		if (info) {
			this.invitation = info;
			if (info.status === 'accepted') {
				this.error = 'This invitation has already been accepted.';
			} else if (info.isExpired) {
				this.error = 'This invitation has expired.';
			} else if (this.isLoggedIn) {
				// Auto-accept if already logged in and invite is valid
				await this.acceptInvite();
				return;
			}
		} else {
			this.error = 'Invitation not found or invalid.';
		}
		this.loading = false;
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
