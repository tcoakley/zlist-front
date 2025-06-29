import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class SnackbarService {
	constructor(private snackBar: MatSnackBar) {}

	showMessage(message: string | any, type: 'success' | 'warning' | 'error' = 'error') {
		let displayMessage: string;

		if (typeof message === 'string') {
			displayMessage = message;
		} else if (message && typeof message === 'object') {
			displayMessage =
				message.message ||
				message.error ||
				message.title ||
				message.detail ||
				message.msg ||
				JSON.stringify(message) ||
				'Unknown error';
		} else {
			displayMessage = 'Unknown error';
		}

		this.snackBar.open(displayMessage, 'X', {
			panelClass: `snackbar-${type}`,
			horizontalPosition: 'end'
		});
	}
}
