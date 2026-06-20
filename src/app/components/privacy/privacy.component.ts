import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-privacy',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './privacy.component.html',
	styleUrls: ['./privacy.component.scss'],
})
export class PrivacyComponent implements OnInit, AfterViewInit {
	protected loading = true;
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('Privacy Policy');
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}
}
