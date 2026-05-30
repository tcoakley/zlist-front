import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { TitleService } from '../../services/title.service';
import { SnackbarService } from '../../services/snackbar.service';
import { ContactService } from '../../services/contact.service';
import { UserStore } from '../../stores/user/user.store';

@Component({
	selector: 'app-contact',
	standalone: true,
	imports: [FormsModule],
	templateUrl: './contact.component.html',
	styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
	private titleService = inject(TitleService);
	private snackbar = inject(SnackbarService);
	private contactService = inject(ContactService);
	protected userStore = inject(UserStore);
	protected location = inject(Location);
	private router = inject(Router);

	firstName = '';
	lastName = '';
	contactType = '';
	message = '';
	sending = false;

	readonly contactTypes = ['Question', 'Bug', 'Feature Request', 'Other'];

	ngOnInit(): void {
		this.titleService.setTitle('Contact');
		const user = this.userStore.user();
		if (user) {
			this.firstName = user.firstName ?? '';
			this.lastName = user.lastName ?? '';
		}
	}

	get canSend(): boolean {
		return !!this.firstName.trim() &&
			!!this.lastName.trim() &&
			!!this.contactType &&
			!!this.message.trim() &&
			!this.sending;
	}

	async send(): Promise<void> {
		if (!this.canSend) return;
		this.sending = true;
		try {
			await firstValueFrom(this.contactService.submit({
				firstName: this.firstName.trim(),
				lastName: this.lastName.trim(),
				contactType: this.contactType,
				message: this.message.trim()
			}));
			this.snackbar.showMessage('Message sent. Thanks for reaching out!', 'success');
			this.router.navigate(['/lists']);
		} catch {
			this.snackbar.showMessage('Failed to send message. Please try again.', 'error');
		} finally {
			this.sending = false;
		}
	}
}
