import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleService } from '../../services/title.service';
import { ListStore } from '../../stores/list/list.store';

@Component({
	selector: 'app-lists',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './lists.component.html',
	styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit {
	protected listStore = inject(ListStore);
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('Lists');
		this.listStore.loadLists();
	}

	createNewList() {
		console.log('createNewList');
	}
}
