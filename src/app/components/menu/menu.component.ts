import { Component, Input, Output, EventEmitter } from '@angular/core';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { Store } from '@ngrx/store';
import { AppState } from '../../stores/user/user.state'; // Adjust path if needed
import { logout } from '../../stores/user/user.actions';

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

	constructor(
		private authService: AuthService,
		private router: Router,
		private store: Store<AppState> // <-- Inject store
	) {}

	navigateTo(route: string) {
		this.menuClosed.emit();
		this.router.navigate([route]);
	}

	logout() {
		console.log("here");
		this.authService.logout();
		this.store.dispatch(logout()); // <-- Dispatch logout action
		this.menuClosed.emit();

		setTimeout(() => {
			this.router.navigate(['/login'], { queryParams: { message: 'Session expired' } });
		}, 100);
	}
}
