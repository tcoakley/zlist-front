import { Component, inject, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-privacy',
	standalone: true,
	templateUrl: './privacy.component.html',
	styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit {
	private location = inject(Location);
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('Privacy Policy');
	}

	goBack() {
		this.location.back();
	}
}
