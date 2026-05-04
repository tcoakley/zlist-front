import { Component, OnInit, inject, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { UserModel } from '../../../models/user.model';
import { UserStore } from '../../stores/user/user.store';

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
	isReady = false;

	email = '';
	password = '';
	firstName = '';
	lastName = '';

	private userStore = inject(UserStore);
	private snackbarService = inject(SnackbarService);
	private router = inject(Router);

	constructor() {
		effect(() => {
			const error = this.userStore.error();
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});
	}

	ngOnInit() {
		this.formReady();
	}

	formReady() {
		this.isReady = !!this.email && !!this.password && !!this.firstName && !!this.lastName;
	}

	async saveForm() {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(this.email)) {
			this.snackbarService.showMessage('Please enter a valid email address.', 'error');
			return;
		}

		const user: UserModel = {
			email: this.email,
			password: this.password,
			firstName: this.firstName,
			lastName: this.lastName
		};

		const success = await this.userStore.signUp(user);
		if (success) {
			this.snackbarService.showMessage('Signup successful', 'success');
			setTimeout(() => this.router.navigate(['/login']), 100);
		}
	}
}
