import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { Observable, combineLatest } from 'rxjs';
import { Store } from '@ngrx/store';
import { AppState } from '../stores/user/user.state';
import { selectAuthInitialized, selectCurrentUser } from '../stores/user/user.selectors';
import { map, filter, take } from 'rxjs/operators';

@Injectable({
	providedIn: 'root',
})
export class AuthGuard implements CanActivate {
	constructor(private store: Store<AppState>, private router: Router) {}

	canActivate(): Observable<boolean | UrlTree> {
		return combineLatest([
			this.store.select(selectCurrentUser),
			this.store.select(selectAuthInitialized)
		]).pipe(
			filter(([_, initialized]) => initialized), 
			take(1),
			map(([user]) => {
				if (user) {
					return true;
				}
				return this.router.createUrlTree(['/login'], {
					queryParams: { message: 'Please log in' }
				});
			})
		);
	}
}
