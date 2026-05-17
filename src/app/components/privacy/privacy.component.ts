import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-privacy',
	standalone: true,
	templateUrl: './privacy.component.html',
	styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit, AfterViewInit {
	protected loading = true;
	private location = inject(Location);
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('Privacy Policy');
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	goBack() {
		this.location.back();
	}
}
