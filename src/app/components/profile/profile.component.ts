import { Component, OnInit, AfterViewInit, inject, effect } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { Location } from '@angular/common';
import { UserModel } from '../../../models/user.model';
import { UserStore } from '../../stores/user/user.store';

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, AfterViewInit {
	protected loading = true;
	isReady = false;
	originalUser: UserModel | null = null;

	email = '';
	password = '';
	showPassword = false;
	firstName = '';
	lastName = '';
	isHelpEnabled = true;
	sortCompletedToBottom = true;

	protected userStore = inject(UserStore);
	private snackbarService = inject(SnackbarService);
	private titleService = inject(TitleService);
	protected location = inject(Location);

	constructor() {
		effect(() => {
			const user = this.userStore.user();
			if (user) {
				this.originalUser = { ...user };
				this.email = user.email;
				this.firstName = user.firstName;
				this.lastName = user.lastName;
				this.isHelpEnabled = user.isHelpEnabled ?? true;
				this.sortCompletedToBottom = user.sortCompletedToBottom ?? true;
				this.formReady();
			}
		});

		effect(() => {
			const error = this.userStore.error();
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});
	}

	ngOnInit() {
		this.titleService.setTitle('Profile');
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	formReady() {
		this.isReady = !!this.email && !!this.firstName && !!this.lastName && this.hasChanges();
	}

	hasChanges(): boolean {
		if (!this.originalUser) return false;
		return (
			this.email !== this.originalUser.email ||
			this.firstName !== this.originalUser.firstName ||
			this.lastName !== this.originalUser.lastName ||
			this.isHelpEnabled !== (this.originalUser.isHelpEnabled ?? true) ||
			this.sortCompletedToBottom !== (this.originalUser.sortCompletedToBottom ?? true) ||
			(!!this.password && this.password.trim().length > 0)
		);
	}

	async saveForm() {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(this.email)) {
			this.snackbarService.showMessage('Please enter a valid email address.', 'error');
			return;
		}

		const user: UserModel = {
			id: this.originalUser?.id,
			email: this.email,
			password: this.password || '',
			firstName: this.firstName,
			lastName: this.lastName,
			isHelpEnabled: this.isHelpEnabled,
			sortCompletedToBottom: this.sortCompletedToBottom
		};

		const success = await this.userStore.updateUser(user);
		if (!success) return;

		this.snackbarService.showMessage('Profile updated successfully', 'success');
		this.originalUser = { ...user, password: '' };
		this.password = '';
		this.formReady();
	}
}
