import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { RouterOutlet, Router } from '@angular/router';
import { TitleBarComponent } from './components/title-bar/title-bar.component';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, TitleBarComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	isLoggedIn: boolean = false;

	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	ngOnInit() {
		this.checkLoginStatus();
	}

	checkLoginStatus() {
		this.authService.isLoggedIn$.subscribe(status => {
			this.isLoggedIn = status;
		});	}

	logout() {
		localStorage.removeItem('token');
		this.isLoggedIn = false;
		this.router.navigate(['/login']);
	}

}
