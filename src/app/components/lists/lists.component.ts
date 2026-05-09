import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AutofocusDirective } from '../../directives/autofocus.directive';
import { SnackbarService } from '../../services/snackbar.service';
import { TitleService } from '../../services/title.service';
import { ListStore } from '../../stores/list/list.store';

@Component({
	selector: 'app-lists',
	standalone: true,
	imports: [FormsModule, AutofocusDirective],
	templateUrl: './lists.component.html',
	styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit {
	protected listStore = inject(ListStore);
	private router = inject(Router);
	private titleService = inject(TitleService);
	private snackbarService = inject(SnackbarService);

	showForm = false;
	listName = '';
	listDescription = '';

	ngOnInit() {
		this.titleService.setTitle('Lists');
		this.listStore.loadLists();
	}

	openForm() {
		this.showForm = true;
	}

	cancelForm() {
		this.showForm = false;
		this.listName = '';
		this.listDescription = '';
	}

	async saveList() {
		if (!this.listName.trim()) return;

		const newList = await this.listStore.addList({
			id: 0,
			listName: this.listName.trim(),
			listDescription: this.listDescription.trim() || undefined,
			items: [],
			listRuns: []
		});

		if (!newList) {
			this.snackbarService.showMessage(this.listStore.error(), 'error');
			return;
		}

		this.router.navigate(['/lists', newList.id]);
	}

	navigateToList(id: number) {
		this.router.navigate(['/lists', id]);
	}
}
