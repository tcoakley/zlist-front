import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { LoginComponent } from './components/login/login.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, LoginComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	isLoggedIn: boolean;

	constructor(private authService: AuthService) {
		this.isLoggedIn = this.authService.isAuthenticated();
	}
}
