import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
export class ForgotPasswordComponent implements OnInit {
	email = ''; 

	constructor(
		private snackbarService: SnackbarService, 
		private http: HttpClient, 
		private router: Router,
		private authService: AuthService
	) {}

	ngOnInit() {}

	send() {

	}
}
