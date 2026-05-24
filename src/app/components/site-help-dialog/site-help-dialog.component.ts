import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { HelpContext } from '../../services/title.service';

@Component({
	selector: 'app-site-help-dialog',
	standalone: true,
	imports: [MatDialogModule],
	templateUrl: './site-help-dialog.component.html',
	styleUrls: ['./site-help-dialog.component.scss'],
})
export class SiteHelpDialogComponent {
	private data = inject<{ context: HelpContext }>(MAT_DIALOG_DATA);

	createListOpen = this.data.context === 'create-list';
	listsOpen = this.data.context === 'lists';
	editListOpen = this.data.context === 'edit-list';
	pricingOpen = false;

	toggle(section: 'createList' | 'lists' | 'editList' | 'pricing') {
		const wasOpen = (
			section === 'createList' ? this.createListOpen :
			section === 'lists' ? this.listsOpen :
			section === 'editList' ? this.editListOpen :
			this.pricingOpen
		);
		this.createListOpen = false;
		this.listsOpen = false;
		this.editListOpen = false;
		this.pricingOpen = false;
		if (!wasOpen) {
			if (section === 'createList') this.createListOpen = true;
			else if (section === 'lists') this.listsOpen = true;
			else if (section === 'editList') this.editListOpen = true;
			else this.pricingOpen = true;
		}
	}
}
