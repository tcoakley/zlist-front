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

	createListOpen = false;
	listsOpen = false;
	editListOpen = false;
	runListOpen = false;
	pricingOpen = false;

	get focusedSection(): string | null {
		switch (this.data.context) {
			case 'lists': return 'lists';
			case 'create-list': return 'createList';
			case 'edit-list': return 'editList';
			default: return null;
		}
	}

	toggle(section: 'createList' | 'lists' | 'editList' | 'runList' | 'pricing') {
		const wasOpen = (
			section === 'createList' ? this.createListOpen :
			section === 'lists' ? this.listsOpen :
			section === 'editList' ? this.editListOpen :
			section === 'runList' ? this.runListOpen :
			this.pricingOpen
		);
		this.createListOpen = false;
		this.listsOpen = false;
		this.editListOpen = false;
		this.runListOpen = false;
		this.pricingOpen = false;
		if (!wasOpen) {
			if (section === 'createList') this.createListOpen = true;
			else if (section === 'lists') this.listsOpen = true;
			else if (section === 'editList') this.editListOpen = true;
			else if (section === 'runList') this.runListOpen = true;
			else this.pricingOpen = true;
		}
	}
}
