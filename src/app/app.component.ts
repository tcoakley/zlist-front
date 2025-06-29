import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { filter } from 'rxjs/operators';
import { Store, select } from '@ngrx/store';
import { selectIsLoggedIn } from './stores/user/user.selectors'; 
import { loginWithToken } from './stores/user/user.actions'; 

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
		private router: Router,
		private store: Store
	) {}

	ngOnInit() {
		const token =
			localStorage.getItem('authToken') ||
			sessionStorage.getItem('authToken');
		if (token) {
			this.store.dispatch(loginWithToken({ token }));
		}
		this.store.pipe(select(selectIsLoggedIn)).subscribe(status => {
			this.isLoggedIn = status;
		});

		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: NavigationEnd) => {
			this.layoutTop = event.urlAfterRedirects.startsWith('/lists');
		});
	}

	logout() {
		localStorage.removeItem('authToken');
		sessionStorage.removeItem('authToken');
		this.isLoggedIn = false;
		this.router.navigate(['/login']);
	}

}
