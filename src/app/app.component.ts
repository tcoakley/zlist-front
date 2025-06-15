import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { filter } from 'rxjs/operators';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, TitleBarComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent {
	isLoggedIn: boolean = false;
	layoutTop = false;

	constructor(
		private authService: AuthService,
		private router: Router
	) {}

	ngOnInit() {
		this.checkLoginStatus();

		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: NavigationEnd) => {
			this.layoutTop = event.urlAfterRedirects.startsWith('/lists');
		});
	}

	checkLoginStatus() {
		this.authService.isLoggedIn$.subscribe(status => {
			this.isLoggedIn = status;
		});
	}

	logout() {
		localStorage.removeItem('token');
		this.isLoggedIn = false;
		this.router.navigate(['/login']);
	}
}
