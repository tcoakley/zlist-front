import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { UserStore } from '../stores/user/user.store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
	private userStore = inject(UserStore);
	private router = inject(Router);
	private authInitialized$ = toObservable(this.userStore.authInitialized);

	canActivate(): Observable<boolean | UrlTree> | boolean | UrlTree {
		if (this.userStore.authInitialized()) {
			return this.userStore.isLoggedIn() || this.router.createUrlTree(['/login'], { queryParams: { message: 'Please log in' } });
		}

		return this.authInitialized$.pipe(
			filter(Boolean),
			take(1),
			map(() => this.userStore.isLoggedIn() || this.router.createUrlTree(['/login'], { queryParams: { message: 'Please log in' } }))
		);
	}
}
