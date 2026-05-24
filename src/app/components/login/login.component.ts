import { Component, AfterViewInit, inject, effect } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
export class LoginComponent implements AfterViewInit {
	protected loading = true;
	email = '';
	password = '';
	rememberMe = false;
	readonly isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
	readonly currentYear = new Date().getFullYear();

	private userStore = inject(UserStore);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private snackbarService = inject(SnackbarService);

	constructor() {
		effect(() => {
			if (this.userStore.user()) {
				const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
				this.router.navigateByUrl(returnUrl ?? '/lists');
			}
		});

		effect(() => {
			const error = this.userStore.error();
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	login() {
		this.userStore.login(this.email, this.password, this.rememberMe);
	}
}
