import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { Location } from '@angular/common';
import { Store } from '@ngrx/store';
import { AppState } from '../../stores/user/user.state';
import { UserModel } from '../../../models/user.model';
import { updateUser } from '../../stores/user/user.actions';
import { selectCurrentUser, selectUserError } from '../../stores/user/user.selectors';

@Component({
	selector: 'app-profile',
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: './profile.component.html',
	styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
	isReady: boolean = false;
	originalUser: UserModel | null = null;

	// Form fields
	email: string = '';
	password: string = '';
	firstName: string = '';
	lastName: string = '';

	private store = inject(Store<AppState>);
	private snackbarService = inject(SnackbarService);
	private titleService = inject(TitleService);
	private location = inject(Location);

	ngOnInit() {
		this.titleService.setTitle('Profile');

		this.store.select(selectCurrentUser).subscribe(user => {
			if (user) {
				this.originalUser = { ...user };
				this.email = user.email;
				this.firstName = user.firstName;
				this.lastName = user.lastName;
				this.formReady();
			}
		});

		this.store.select(selectUserError).subscribe(error => {
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});
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
			(!!this.password && this.password.trim().length > 0)
		);
	}

	saveForm() {
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
			lastName: this.lastName
		};

		this.store.dispatch(updateUser({ user }));

		// Optimistically update UI (optional: confirm with effect)
		this.snackbarService.showMessage('Profile updated successfully', 'success');
		this.originalUser = { ...user, password: '' };
		this.password = '';
		this.formReady();
	}
}
