import { Component, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { Store } from '@ngrx/store';
import { UserModel } from '../../../models/user.model';
import { AppState } from '../../stores/user/user.state';
import { signUp } from '../../stores/user/user.actions';
import { selectUserError } from '../../stores/user/user.selectors';

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit {
	isReady: boolean = false;

	// Form fields
	email: string = '';
	password: string = '';
	firstName: string = '';
	lastName: string = '';

	private store = inject(Store<AppState>);
	private snackbarService = inject(SnackbarService);
	private router = inject(Router);

	ngOnInit() {
		this.formReady();

		this.store.select(selectUserError).subscribe(error => {
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});

		this.store.select(state => state.user).subscribe(userState => {
			if (!userState.loading && !userState.error) {
				this.snackbarService.showMessage('Signup successful', 'success');
				setTimeout(() => this.router.navigate(['/login']), 100);
			}
		});
	}

	formReady() {
		this.isReady = !!this.email && !!this.password && !!this.firstName && !!this.lastName;
	}

	saveForm() {
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

		this.store.dispatch(signUp({ user }));
	}
}
