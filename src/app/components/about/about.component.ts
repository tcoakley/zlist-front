import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-about',
	standalone: true,
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit {
	private location = inject(Location);
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('About');
	}

	goBack() {
		this.location.back();
	}
}
