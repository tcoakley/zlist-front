import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

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
	@Output() menuClosed = new EventEmitter<void>(); // ✅ Notify parent when closing

	constructor(private authService: AuthService, private router: Router) {}

	navigateTo(route: string) {
		this.menuClosed.emit(); // ✅ Tell TitleBar to close the menu
		this.router.navigate([route]);
	}

	logout() {
		this.authService.logout();
		this.menuClosed.emit(); // ✅ Tell TitleBar to close the menu
		this.router.navigate(['/login']);
	}
}
