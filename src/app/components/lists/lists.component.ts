import { Component, OnInit  } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-lists',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './lists.component.html',
	styleUrls: ['./lists.component.scss'],
})
export class ListsComponent implements OnInit {

	constructor(
		private http: HttpClient, 
		private router: Router,
		private titleService: TitleService
	) {}

	ngOnInit() {
		this.titleService.setTitle('Lists');
	}
	
	createNewList() {
		console.log("here");
	}
}
