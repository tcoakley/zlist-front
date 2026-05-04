import { Component, OnInit, inject, effect } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
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
export class LoginComponent implements OnInit {
	email = '';
	password = '';
	rememberMe = false;

	private userStore = inject(UserStore);
	private router = inject(Router);
	private snackbarService = inject(SnackbarService);
	private route = inject(ActivatedRoute);

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

	ngOnInit() {
		this.route.queryParams.subscribe(params => {
			const message = params['message'];
			if (message) {
				this.snackbarService.showMessage(message, 'warning');
			}
		});
	}

	login() {
		this.userStore.login(this.email, this.password, this.rememberMe);
	}
}
