import { Injectable, signal } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type HelpContext = 'create-list' | 'lists' | 'edit-list' | null;

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
	helpContext = signal<HelpContext>(null);
	animateHelp = signal(false);

	setTitle(newTitle: string) {
		this.titleSubject.next(newTitle);
	}

	setActionButton(action: TitleAction | null) {
		this.actionButton.set(action);
	}

	setHelpContext(context: HelpContext) {
		this.helpContext.set(context);
	}

	setAnimateHelp(value: boolean) {
		this.animateHelp.set(value);
	}
}
