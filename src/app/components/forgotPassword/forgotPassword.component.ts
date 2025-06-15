import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
	selector: 'app-forgot-password',
	standalone: true,
	imports: [FormsModule, AutofocusDirective, RouterLink, CommonModule],
	templateUrl: './forgotPassword.component.html',
	styleUrls: ['./forgotPassword.component.scss'],
})
export class ForgotPasswordComponent implements OnInit {
	email = ''; 
	loading = false; 
	constructor(
		private snackbarService: SnackbarService, 
		private router: Router,
		private authService: AuthService
	) {}

	ngOnInit() {}

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
