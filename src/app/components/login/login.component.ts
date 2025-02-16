import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';

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

	constructor(private http: HttpClient, private router: Router) {}

	login() {
		const payload = { email: this.email, password: this.password };
		console.log("payload", payload);
		this.http.post<{ token: string }>(this.apiUrl, payload).subscribe({
			next: (response) => {
				localStorage.setItem('authToken', response.token);
				this.router.navigate(['/lists']);
			},
			error: (err) => {
				console.error('Login failed', err);
				alert('Login failed. Please check your credentials.');
			},
		});
	}
}
