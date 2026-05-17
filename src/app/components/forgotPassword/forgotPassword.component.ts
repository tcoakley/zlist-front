import { Component, OnInit, AfterViewInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-forgot-password',
	standalone: true,
	imports: [FormsModule, AutofocusDirective, RouterLink],
	templateUrl: './forgotPassword.component.html',
	styleUrls: ['./forgotPassword.component.scss'],
})
export class ForgotPasswordComponent implements OnInit, AfterViewInit {
	email = '';
	loading = false;
	viewReady = false;
	constructor(
		private snackbarService: SnackbarService, 
		private router: Router,
		private authService: AuthService
	) {}

	ngOnInit() {}

	ngAfterViewInit(): void {
		setTimeout(() => this.viewReady = true, 100);
	}

	send() {
		if (!this.email.trim()) {
			this.snackbarService.showMessage('Please enter your email', 'error');
			return;
		}

		this.loading = true; 
		this.authService.forgotPassword(this.email).subscribe({
			next: (message) => {
				console.log("message", message);
				this.snackbarService.showMessage(message, 'success');
				this.router.navigate(['/login']);
			},
			error: (err) => {
				console.log("err", err);
				const errorMessage = err.error?.message || err.message || 'Something went wrong. Please try again.';
				this.snackbarService.showMessage(errorMessage, 'error');
			},
			complete: () => {
				this.loading = false;
			}
		});
	}
}
