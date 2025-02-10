import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http'; 
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';

bootstrapApplication(AppComponent, {
	providers: [
		provideRouter(routes), 
		provideHttpClient(withInterceptorsFromDi()), 
	],
}).catch((err) => console.error(err));
