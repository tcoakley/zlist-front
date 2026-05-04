import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(withInterceptorsFromDi()),
		provideAnimations(),
		{
			provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
			useValue: <MatSnackBarConfig>{
				duration: 8000,
				verticalPosition: 'top',
				horizontalPosition: 'center'
			}
		}
	]
};
