import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { UserStore } from '../../stores/user.store';

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

	constructor(
		private snackbarService: SnackbarService, 
		private router: Router,
		private userStore: UserStore
	) {}

	ngOnInit() {
		const storedToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		if (storedToken) {
			this.userStore.loginWithToken(storedToken).subscribe(() => {
				this.router.navigate(['/lists']);
			});
		}
	}

	login() {
		this.userStore.login(this.email, this.password).subscribe(response => {
			if (this.rememberMe) {
				localStorage.setItem('authToken', response.token);
			} else {
				sessionStorage.setItem('authToken', response.token);
			}
			this.router.navigate(['/lists']);
		});
	}
}
