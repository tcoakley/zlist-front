import { Component, OnInit, ChangeDetectorRef, EventEmitter, Output } from '@angular/core';
import { TitleService } from '../../services/title.service';
import { MenuComponent } from '../menu/menu.component';

@Component({
	selector: 'app-title-bar',
	imports: [MenuComponent],
	templateUrl: './title-bar.component.html',
	styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent implements OnInit {
	@Output() loggedOut = new EventEmitter<void>();
	title = 'Lists';
	isMenuOpen = false;

	constructor(
		private titleService: TitleService,
		private cdRef: ChangeDetectorRef
	) {}

	ngOnInit() {
		this.titleService.title$.subscribe(updatedTitle => {
			this.title = updatedTitle;
			this.cdRef.detectChanges();
		});
	}

	toggleMenu() {
		this.isMenuOpen = !this.isMenuOpen;
	}

	// ✅ Close menu when event is received
	closeMenu() {
		this.isMenuOpen = false;
	}

	logout() {
		this.loggedOut.emit();
	}
}
