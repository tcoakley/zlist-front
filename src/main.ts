import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { AppState } from './app/stores/user/user.state';
import { Store } from '@ngrx/store';
import { loginWithToken } from './app/stores/user/user.actions';

bootstrapApplication(AppComponent, appConfig)
	.then(appRef => {
		const store = appRef.injector.get<Store<AppState>>(Store);

		const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
		if (token) {
			store.dispatch(loginWithToken({ token }));
		}
	})
	.catch(err => console.error(err));
