import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-terms',
	standalone: true,
	templateUrl: './terms.component.html',
	styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit {
	private location = inject(Location);
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('Terms of Service');
	}

	goBack() {
		this.location.back();
	}
}
