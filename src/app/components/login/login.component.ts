import { Component, OnInit, computed, inject } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../stores/user/user.state';
import { login, loginWithToken } from '../../stores/user/user.actions';
import { selectCurrentUser, selectUserError } from '../../stores/user/user.selectors';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, AutofocusDirective, RouterLink],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
	email = '';
	password = '';
	rememberMe = false;

	private store = inject(Store<AppState>);
	private router = inject(Router);
	private snackbarService = inject(SnackbarService);
	private route = inject(ActivatedRoute);

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			const message = params['message'];
			if (message) {
				this.snackbarService.showMessage(message, 'warning');
				return;
			}

			const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
			if (storedToken) {
				this.store.dispatch(loginWithToken({ token: storedToken }));
			}
		});

		this.store.select(selectCurrentUser).subscribe(user => {
			console.log("user", user);
			if (user) {
				this.router.navigate(['/lists']);
			}
		});

		this.store.select(selectUserError).subscribe(error => {
			console.log("error", error);
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});
	}

	login() {
		this.store.dispatch(login({
			email: this.email,
			password: this.password,
			rememberMe: this.rememberMe
		}));
	}
}

