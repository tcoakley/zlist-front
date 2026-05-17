import { Component, OnInit, AfterViewInit, inject, effect } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { UserModel } from '../../../models/user.model';
import { UserStore } from '../../stores/user/user.store';
import { environment } from '../../../environments/environment';

@Component({
	selector: 'app-signup',
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: './signup.component.html',
	styleUrls: ['./signup.component.scss']
})
export class SignupComponent implements OnInit, AfterViewInit {
	protected loading = true;
	isReady = false;

	email = '';
	password = '';
	firstName = '';
	lastName = '';
	captchaToken = '';

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

	ngAfterViewInit() {
		setTimeout(() => this.loading = false, 100);
		const tryRender = () => {
			const g = (window as any).grecaptcha;
			if (g && g.render) {
				g.render('recaptcha-container', {
					sitekey: environment.recaptchaSiteKey,
					callback: (token: string) => {
						this.captchaToken = token;
						this.formReady();
					},
					'expired-callback': () => {
						this.captchaToken = '';
						this.formReady();
					}
				});
			} else {
				setTimeout(tryRender, 100);
			}
		};
		tryRender();
	}

	formReady() {
		this.isReady = !!this.email && !!this.password && !!this.firstName && !!this.lastName && !!this.captchaToken;
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
			lastName: this.lastName,
			captchaToken: this.captchaToken
		};

		const success = await this.userStore.signUp(user);
		if (success) {
			this.snackbarService.showMessage('Signup successful', 'success');
			setTimeout(() => this.router.navigate(['/login']), 100);
		}
	}
}
