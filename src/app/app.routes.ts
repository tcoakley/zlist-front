import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { SignupComponent } from './components/signup/signup.component';
import { ListsComponent } from './components/lists/lists.component';
import { ListDetailComponent } from './components/list-detail/list-detail.component';
import { ListRunComponent } from './components/list-run/list-run.component';
import { ForgotPasswordComponent } from './components/forgotPassword/forgotPassword.component';
import { ProfileComponent } from './components/profile/profile.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
	{ path: 'login', component: LoginComponent },
	{ path: 'signup', component: SignupComponent },
	{ path: 'forgotPassword', component: ForgotPasswordComponent },
	{ path: 'lists', component: ListsComponent, canActivate: [AuthGuard] },
	{ path: 'lists/:id', component: ListDetailComponent, canActivate: [AuthGuard] },
	{ path: 'lists/:listId/run/:runId', component: ListRunComponent, canActivate: [AuthGuard] },
	{ path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },
	{ path: '', redirectTo: '/login', pathMatch: 'full' },
	{ path: '**', redirectTo: '/login' },
];
