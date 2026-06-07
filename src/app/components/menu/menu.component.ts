import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserStore } from '../../stores/user/user.store';
import { InstallService } from '../../services/install.service';

@Component({
	selector: 'app-menu',
	standalone: true,
	imports: [CommonModule],
	templateUrl: './menu.component.html',
	styleUrls: ['./menu.component.scss'],
	animations: [
		trigger('bounceIn', [
			transition(':enter', [
				style({ opacity: 0, transform: 'translateY(-100%)' }),
				animate('0.3s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
			]),
			transition(':leave', [
				animate('0.2s ease-in', style({ opacity: 0, transform: 'translateY(-100%)' }))
			])
		])
	]
})
export class MenuComponent {
	@Input() isOpen = false;
	@Output() menuClosed = new EventEmitter<void>();

	protected userStore = inject(UserStore);
	private router = inject(Router);
	protected installService = inject(InstallService);

	navigateTo(route: string) {
		this.menuClosed.emit();
		this.router.navigate([route]);
	}

	async createShortcut() {
		this.menuClosed.emit();
		await this.installService.promptInstall();
	}

	showIosInstall() {
		this.menuClosed.emit();
		this.installService.showIosPrompt();
	}

	logout() {
		this.userStore.logout();
		this.menuClosed.emit();
		this.router.navigate(['/login']);
	}
}
