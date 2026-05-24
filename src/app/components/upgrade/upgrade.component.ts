import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { SubscriptionService, SubscriptionStatus } from '../../services/subscription.service';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-upgrade',
	standalone: true,
	imports: [CommonModule, RouterLink],
	templateUrl: './upgrade.component.html',
	styleUrl: './upgrade.component.scss'
})
export class UpgradeComponent implements OnInit {
	private subscriptionService = inject(SubscriptionService);
	private titleService = inject(TitleService);

	status = signal<SubscriptionStatus | null>(null);
	loading = signal(true);

	ngOnInit(): void {
		this.titleService.setTitle('Plans');
		this.loadStatus();
	}

	private async loadStatus(): Promise<void> {
		try {
			const s = await firstValueFrom(this.subscriptionService.getStatus());
			this.status.set(s);
		} finally {
			this.loading.set(false);
		}
	}
}
