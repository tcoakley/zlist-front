import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class InstallService {
	private deferredPrompt: any = null;

	readonly canInstall = signal(false);
	readonly iosPromptVisible = signal(false);

	readonly isAndroid: boolean = /Android/i.test(navigator.userAgent);
	readonly isIos: boolean = /iPhone|iPad|iPod/i.test(navigator.userAgent);
	readonly isStandalone: boolean = ('standalone' in navigator) && (navigator as any).standalone === true;

	constructor() {
		window.addEventListener('beforeinstallprompt', (e) => {
			e.preventDefault();
			this.deferredPrompt = e;
			this.canInstall.set(true);
		});

		window.addEventListener('appinstalled', () => {
			this.deferredPrompt = null;
			this.canInstall.set(false);
		});
	}

	async promptInstall(): Promise<void> {
		if (!this.deferredPrompt) return;
		this.deferredPrompt.prompt();
		const { outcome } = await this.deferredPrompt.userChoice;
		if (outcome === 'accepted') {
			this.deferredPrompt = null;
			this.canInstall.set(false);
		}
	}

	showIosPrompt(): void {
		this.iosPromptVisible.set(true);
	}

	hideIosPrompt(): void {
		this.iosPromptVisible.set(false);
	}
}
