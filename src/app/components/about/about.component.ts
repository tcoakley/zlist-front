import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { Location } from '@angular/common';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-about',
	standalone: true,
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
	protected loading = true;
	private location = inject(Location);
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('About');
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	goBack() {
		this.location.back();
	}
}
