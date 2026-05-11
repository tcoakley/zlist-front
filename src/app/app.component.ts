import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { filter } from 'rxjs/operators';
import { UserStore } from './stores/user/user.store';
import { InstallService } from './services/install.service';

@Component({
	selector: 'app-root',
	standalone: true,
	imports: [CommonModule, RouterOutlet, TitleBarComponent],
	templateUrl: './app.component.html',
	styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
	protected userStore = inject(UserStore);
	private router = inject(Router);
	protected installService = inject(InstallService);

	layoutTop = false;

	get isLoggedIn() {
		return this.userStore.isLoggedIn();
	}

	constructor() {
		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		if (token) {
			this.userStore.loginWithToken(token);
		}
	}

	ngOnInit() {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: NavigationEnd) => {
			this.layoutTop = event.urlAfterRedirects.startsWith('/lists');
		});

	}
}
