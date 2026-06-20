import { Component, inject, OnInit, AfterViewInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TitleService } from '../../services/title.service';
import { VersionService } from '../../services/version.service';
import { AppVersion } from '../../../models/list.model';

@Component({
	selector: 'app-about',
	standalone: true,
	imports: [RouterLink],
	templateUrl: './about.component.html',
	styleUrls: ['./about.component.scss'],
})
export class AboutComponent implements OnInit, AfterViewInit {
	protected loading = true;
	protected versions: AppVersion[] = [];
	private titleService = inject(TitleService);
	private versionService = inject(VersionService);

	ngOnInit() {
		this.titleService.setTitle('About');
		this.loadVersions();
	}

	ngAfterViewInit(): void {
		setTimeout(() => this.loading = false, 100);
	}

	private async loadVersions() {
		try {
			this.versions = await firstValueFrom(this.versionService.getVersions());
		} catch {
			// Non-critical — about page still works without version info
		}
	}

	get currentVersion(): AppVersion | null {
		return this.versions[0] ?? null;
	}

	getNoteLines(notes: string): string[] {
		return notes.split('\n').map(l => l.trim()).filter(l => l.length > 0);
	}

	formatDate(dateStr: string): string {
		return new Date(dateStr).toLocaleDateString(undefined, {
			year: 'numeric', month: 'long', day: 'numeric'
		});
	}

}
