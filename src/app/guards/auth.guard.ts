import { Injectable, inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs/operators';
import { UserStore } from '../stores/user/user.store';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
	private userStore = inject(UserStore);
	private router = inject(Router);
	private authInitialized$ = toObservable(this.userStore.authInitialized);

	canActivate(_route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> | boolean | UrlTree {
		if (this.userStore.authInitialized()) {
			return this.resolveAccess(state.url);
		}

		return this.authInitialized$.pipe(
			filter(Boolean),
			take(1),
			map(() => this.resolveAccess(state.url))
		);
	}

	private resolveAccess(url: string): boolean | UrlTree {
		if (!this.userStore.isLoggedIn()) {
			return this.router.createUrlTree(['/login'], { queryParams: { message: 'Please log in' } });
		}
		if (this.userStore.needsDowngradeSelection() && url !== '/account') {
			return this.router.createUrlTree(['/select-lists']);
		}
		return true;
	}
}
