import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-terms',
	standalone: true,
	templateUrl: './terms.component.html',
	styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit, AfterViewInit {
	protected loading = true;
	private location = inject(Location);
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('Terms of Service');
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	goBack() {
		this.location.back();
	}
}
