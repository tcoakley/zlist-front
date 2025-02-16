import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class SnackbarService {
	constructor(private snackBar: MatSnackBar) {}

    showMessage(message: string, type: 'success' | 'warning' | 'error' = 'error') {
        this.snackBar.open(message, 'X', {
            panelClass: `snackbar-${type}`
        });
    }
}
