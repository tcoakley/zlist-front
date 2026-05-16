import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TitleService } from '../../services/title.service';
import { UserStore } from '../../stores/user/user.store';
import { MenuComponent } from '../menu/menu.component';
import { SiteHelpDialogComponent } from '../site-help-dialog/site-help-dialog.component';

@Component({
	selector: 'app-title-bar',
	standalone: true,
	imports: [MenuComponent, MatTooltipModule],
	templateUrl: './title-bar.component.html',
	styleUrls: ['./title-bar.component.scss']
})
export class TitleBarComponent implements OnInit {
	protected titleService = inject(TitleService);
	protected userStore = inject(UserStore);
	private dialog = inject(MatDialog);
	private cdRef = inject(ChangeDetectorRef);

	title = 'Lists';
	isMenuOpen = false;

	ngOnInit() {
		this.titleService.title$.subscribe(updatedTitle => {
			this.title = updatedTitle;
			this.cdRef.detectChanges();
		});
	}

	toggleMenu() {
		this.isMenuOpen = !this.isMenuOpen;
	}

	closeMenu() {
		this.isMenuOpen = false;
	}

	openHelp() {
		this.dialog.open(SiteHelpDialogComponent, {
			data: { context: this.titleService.helpContext() },
			width: '90vw',
			maxWidth: '560px',
		});
	}
}
