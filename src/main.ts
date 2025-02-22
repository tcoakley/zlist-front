import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; 
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS, MatSnackBarConfig } from '@angular/material/snack-bar';


bootstrapApplication(AppComponent, {
	providers: [
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
	],
}).catch((err) => console.error(err));
