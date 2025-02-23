import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [FormsModule, AutofocusDirective],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
	email = ''; 
	password = ''; 
	rememberMe = false;
	apiUrl = 'https://localhost:7224/api/login';

	constructor(
		private snackbarService: SnackbarService, 
		private http: HttpClient, 
		private router: Router,
		private authService: AuthService
	) {}

	ngOnInit() {
		const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		if (storedToken) {
			this.authService.loginWithToken(storedToken);
			this.router.navigate(['/lists']);
		}
	}

	login() {
		this.authService.login(this.email, this.password).subscribe(response => {
			if (this.rememberMe) {
				localStorage.setItem('authToken', response.token);
			} else {
				sessionStorage.setItem('authToken', response.token);
			}
			this.router.navigate(['/lists']);
		});
	}
}
