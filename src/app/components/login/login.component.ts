import { Component, inject, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { UserStore } from '../../stores/user/user.store';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, AutofocusDirective, RouterLink],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	email = '';
	password = '';
	rememberMe = false;

	private userStore = inject(UserStore);
	private router = inject(Router);
	private snackbarService = inject(SnackbarService);

	constructor() {
		effect(() => {
			if (this.userStore.user()) {
				this.router.navigate(['/lists']);
			}
		});

		effect(() => {
			const error = this.userStore.error();
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});
	}

	login() {
		this.userStore.login(this.email, this.password, this.rememberMe);
	}
}
