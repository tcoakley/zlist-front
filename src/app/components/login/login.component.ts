import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';

@Component({
	selector: 'app-login',
	standalone: true,
	imports: [RouterLink, FormsModule, AutofocusDirective],
	templateUrl: './login.component.html',
	styleUrls: ['./login.component.scss'],
})
export class LoginComponent {
	email = ''; 
	password = ''; 
	apiUrl = 'https://localhost:7224/api/login';

	constructor(
		private snackbarService: SnackbarService, 
		private http: HttpClient, 
		private router: Router,
		private authService: AuthService
	) {}

	login() {
		this.authService.login(this.email, this.password).subscribe(() => {
			this.router.navigate(['/lists']);
		});
	}
}
