import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';

import { userReducer } from './stores/user/user.reducer';
import { UserEffects } from './stores/user/user.effects';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
	providers: [
		provideZoneChangeDetection({ eventCoalescing: true }),
		provideRouter(routes),
		provideHttpClient(withInterceptorsFromDi()),
		provideAnimations(),
		provideStore({ user: userReducer }),
		provideEffects([UserEffects]),
		provideStoreDevtools({ maxAge: 25 }),
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
