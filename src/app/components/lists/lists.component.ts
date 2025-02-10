import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
	selector: 'app-lists',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './lists.component.html',
	styleUrls: ['./lists.component.scss'],
})
export class ListsComponent {

	constructor(private http: HttpClient, private router: Router) {}

}
