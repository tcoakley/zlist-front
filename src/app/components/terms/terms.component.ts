import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TitleService } from '../../services/title.service';

@Component({
	selector: 'app-terms',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './terms.component.html',
	styleUrls: ['./terms.component.scss'],
})
export class TermsComponent implements OnInit, AfterViewInit {
	protected loading = true;
	private titleService = inject(TitleService);

	ngOnInit() {
		this.titleService.setTitle('Terms of Service');
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}
}
