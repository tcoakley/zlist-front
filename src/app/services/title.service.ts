import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface TitleAction {
	label: string;
	show: () => boolean;
	disabled: () => boolean;
	loading: () => boolean;
	action: () => void;
}

@Injectable({
	providedIn: 'root',
})
export class TitleService {
	private titleSubject = new BehaviorSubject<string>('Lists');
	title$ = this.titleSubject.asObservable();

	actionButton = signal<TitleAction | null>(null);

	setTitle(newTitle: string) {
		this.titleSubject.next(newTitle);
	}

	setActionButton(action: TitleAction | null) {
		this.actionButton.set(action);
	}
}
