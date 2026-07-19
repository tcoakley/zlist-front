import { Injectable, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { VersionService } from './version.service';

const POLL_INTERVAL_MS = 15 * 60 * 1000;

@Injectable({ providedIn: 'root' })
export class VersionCheckService {
	readonly updateAvailable = signal(false);
	readonly latestVersion = signal<string | null>(null);

	private baselineVersion: string | null = null;
	private pollHandle: ReturnType<typeof setInterval> | null = null;

	constructor(private versionService: VersionService) {
		this.checkForUpdate(true);

		this.pollHandle = setInterval(() => this.checkForUpdate(false), POLL_INTERVAL_MS);
		document.addEventListener('visibilitychange', () => {
			if (document.visibilityState === 'visible') this.checkForUpdate(false);
		});
	}

	private async checkForUpdate(isInitial: boolean): Promise<void> {
		try {
			const versions = await firstValueFrom(this.versionService.getVersions());
			const latest = versions[0]?.version;
			if (!latest) return;

			if (isInitial) {
				this.baselineVersion = latest;
				return;
			}

			if (this.baselineVersion && latest !== this.baselineVersion) {
				this.updateAvailable.set(true);
				this.latestVersion.set(latest);
				document.documentElement.style.setProperty('--update-banner-height', '32px');
				if (this.pollHandle) {
					clearInterval(this.pollHandle);
					this.pollHandle = null;
				}
			}
		} catch {
			// Silently skip this tick — a failed check should never surface an error to the user.
		}
	}
}
