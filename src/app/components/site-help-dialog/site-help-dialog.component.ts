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

	toggle(section: 'createList' | 'lists' | 'editList') {
		if (section === 'createList') this.createListOpen = !this.createListOpen;
		else if (section === 'lists') this.listsOpen = !this.listsOpen;
		else this.editListOpen = !this.editListOpen;
	}
}
