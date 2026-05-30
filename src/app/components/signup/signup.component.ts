import { Component, OnInit, AfterViewInit, inject, effect, NgZone } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
	inviteToken = '';

	private userStore = inject(UserStore);
	private snackbarService = inject(SnackbarService);
	private router = inject(Router);
	private route = inject(ActivatedRoute);
	private ngZone = inject(NgZone);

	constructor() {
		effect(() => {
			const error = this.userStore.error();
			if (error) {
				this.snackbarService.showMessage(error, 'error');
			}
		});
	}

	ngOnInit() {
		this.inviteToken = this.route.snapshot.queryParamMap.get('inviteToken') ?? '';
		this.formReady();
	}

	ngAfterViewInit() {
		setTimeout(() => this.loading = false, 100);
		this.initCaptcha();
	}

	private initCaptcha() {
		const g = (window as any).grecaptcha;
		if (g && g.ready) {
			g.ready(() => this.renderCaptcha());
		} else {
			setTimeout(() => this.initCaptcha(), 100);
		}
	}

	private renderCaptcha() {
		const container = document.getElementById('recaptcha-container');
		if (!container) {
			setTimeout(() => this.renderCaptcha(), 100);
			return;
		}
		const g = (window as any).grecaptcha;
		g.render('recaptcha-container', {
			sitekey: environment.recaptchaSiteKey,
			callback: (token: string) => {
				this.ngZone.run(() => {
					this.captchaToken = token;
					this.formReady();
				});
			},
			'expired-callback': () => {
				this.ngZone.run(() => {
					this.captchaToken = '';
					this.formReady();
				});
			}
		});
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
			this.snackbarService.showMessage('Signup successful — please log in', 'success');
			const dest = this.inviteToken
				? `/login?returnUrl=${encodeURIComponent('/invite/' + this.inviteToken)}`
				: '/login';
			setTimeout(() => this.router.navigateByUrl(dest), 100);
		}
	}
}
