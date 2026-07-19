import { Injectable, signal } from '@angular/core';

const OFFLINE_BANNER_HEIGHT = '32px';

@Injectable({ providedIn: 'root' })
export class ConnectivityService {
	readonly isOnline = signal(navigator.onLine);

	constructor() {
		window.addEventListener('online', () => this.setOnline(true));
		window.addEventListener('offline', () => this.setOnline(false));
		this.setOnline(navigator.onLine);
	}

	private setOnline(online: boolean): void {
		this.isOnline.set(online);
		document.documentElement.style.setProperty('--offline-banner-height', online ? '0px' : OFFLINE_BANNER_HEIGHT);
	}
}
