import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { TitleBarComponent } from './components/title-bar/title-bar.component';
import { filter } from 'rxjs/operators';
import { UserStore } from './stores/user/user.store';
import { InstallService } from './services/install.service';
import { ConnectivityService } from './services/connectivity.service';
import { VersionCheckService } from './services/version-check.service';

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
	protected connectivityService = inject(ConnectivityService);
	protected versionCheckService = inject(VersionCheckService);

	layoutTop = false;

	get isLoggedIn() {
		return this.userStore.isLoggedIn();
	}

	constructor() {
		this.userStore.tryRestoreSession();
	}

	reloadApp(): void {
		window.location.reload();
	}

	ngOnInit() {
		this.router.events.pipe(
			filter(event => event instanceof NavigationEnd)
		).subscribe((event: NavigationEnd) => {
			this.layoutTop = event.urlAfterRedirects.startsWith('/lists');
		});

	}
}
